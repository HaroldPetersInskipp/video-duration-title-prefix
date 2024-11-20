// ==UserScript==
// @name         YouTube SponsorBlock/Duration Title Prefix
// @namespace    https://github.com/HaroldPetersInskipp/
// @version      1.2.0
// @homepageURL  https://github.com/HaroldPetersInskipp/video-duration-title-prefix
// @supportURL   https://github.com/HaroldPetersInskipp/video-duration-title-prefix/issues
// @description  Prefix the YouTube tab title with the SponsorBlock duration or the video duration if SponsorBlock is unavailable, and remove the prefix on non-watch pages.
// @author       Inskipp
// @copyright    2024+, HaroldPetersInskipp
// @match        https://www.youtube.com/*
// @grant        none
// @license      MIT; https://github.com/HaroldPetersInskipp/video-duration-title-prefix/blob/main/LICENSE
// @icon         https://raw.githubusercontent.com/HaroldPetersInskipp/video-duration-title-prefix/main/icon.png
// @run-at       document-idle
// ==/UserScript==

(function () {
    'use strict';

    let lastKnownURL = location.href;

    /**
     * Updates the tab's title by prefixing it with the SponsorBlock duration or video duration.
     */
    function updateTitle() {
        if (!location.href.startsWith("https://www.youtube.com/watch?v=")) {
            // Remove any existing prefix if not on a video watch page.
            document.title = document.title.replace(/^\[.*?\] /, '');
            return;
        }

        let prefix = null;

        // Try to get the SponsorBlock duration.
        const sponsorElement = document.getElementById('sponsorBlockDurationAfterSkips');
        if (sponsorElement && sponsorElement.innerText.trim()) {
            prefix = sponsorElement.innerText.trim();
            prefix = prefix.replaceAll("(", "").replaceAll(")", "");
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

    /**
     * Checks for URL changes and triggers title updates.
     */
    function monitorURLChanges() {
        if (location.href !== lastKnownURL) {
            lastKnownURL = location.href;
            updateTitle();
        }
    }

    // Initialize mutation observer and URL change monitor.
    if (location.hostname === 'www.youtube.com') {
        observeTitleChanges();
        updateTitle(); // Initial check.
        // Monitor URL changes using both popstate and a setInterval for reliability.
        window.addEventListener('popstate', monitorURLChanges);
        setInterval(monitorURLChanges, 500); // Fallback for pushState navigation.
    }
})();
