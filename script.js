// ==UserScript==
// @name         YouTube SponsorBlock/Duration Title Prefix
// @namespace    https://github.com/HaroldPetersInskipp/
// @version      1.1.1
// @homepageURL  https://github.com/HaroldPetersInskipp/video-duration-title-prefix
// @supportURL   https://github.com/HaroldPetersInskipp/video-duration-title-prefix/issues
// @description  Prefix the YouTube tab title with the SponsorBlock duration or the video duration if SponsorBlock is unavailable.
// @author       Inskipp
// @copyright    2024+, HaroldPetersInskipp (https://github.com/HaroldPetersInskipp)
// @match        https://www.youtube.com/watch*
// @grant        none
// @license      MIT; https://github.com/HaroldPetersInskipp/video-duration-title-prefix/blob/main/LICENSE
// @icon         https://raw.githubusercontent.com/HaroldPetersInskipp/video-duration-title-prefix/main/icon.png
// @run-at       document-idle
// ==/UserScript==

(function () {
    'use strict';

    /**
     * Updates the tab's title by prefixing it with the SponsorBlock duration or video duration.
     */
    function updateTitle() {
        let prefix = null;

        // Try to get the SponsorBlock duration.
        const sponsorElement = document.getElementById('sponsorBlockDurationAfterSkips');
        if (sponsorElement && sponsorElement.innerText.trim()) {
            prefix = sponsorElement.innerText.trim();
            prefix = prefix.replaceAll("(","").replaceAll(")","");
        }

        // Fallback to the video duration if SponsorBlock is unavailable.
        if (!prefix) {
            const durationElement = document.querySelector('.ytp-time-duration');
            if (durationElement && durationElement.innerText.trim()) {
                prefix = durationElement.innerText.trim();
            }
        }

        // Update the document title if a prefix was found.
        if (prefix) {
            const originalTitle = document.title.replace(/^\[.*?\] /, ''); // Remove any existing prefix.
            document.title = `[${prefix}] ${originalTitle}`;
        }
    }

    /**
     * Observes changes in the DOM and updates the tab's title when necessary.
     */
    function observeTitleChanges() {
        const observer = new MutationObserver(updateTitle);

        // Observe the entire document body for changes.
        observer.observe(document.body, { childList: true, subtree: true });
    }

    // Check if the page is YouTube and start observing.
    if (location.hostname === 'www.youtube.com') {
        observeTitleChanges();
    }
})();
