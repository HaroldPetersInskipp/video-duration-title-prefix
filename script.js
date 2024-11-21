// ==UserScript==
// @name         YouTube SponsorBlock/Duration Title Prefix
// @namespace    https://github.com/HaroldPetersInskipp/
// @version      1.2.1
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

    /**
     * Updates the title prefix for YouTube watch pages.
     * Prioritizes SponsorBlock durations, falling back to video durations.
     */
    function updateTitle() {
        if (!location.href.startsWith("https://www.youtube.com/watch?v=")) {
            // Remove any existing prefix if not on a watch page
            document.title = document.title.replace(/^\[.*?\] /, '');
            return;
        }

        let prefix = null;

        // Try to fetch the SponsorBlock duration first
        const sponsorElement = document.getElementById('sponsorBlockDurationAfterSkips');
        if (sponsorElement && sponsorElement.innerText.trim()) {
            prefix = sponsorElement.innerText.trim().replace(/[()]/g, '');
        }

        // Fallback to the video duration if SponsorBlock is unavailable
        if (!prefix) {
            const durationElement = document.querySelector('.ytp-time-duration');
            if (durationElement && durationElement.innerText.trim()) {
                prefix = durationElement.innerText.trim();
            }
        }

        // Update the document title if a prefix is found
        if (prefix) {
            const originalTitle = document.title.replace(/^\[.*?\] /, ''); // Remove any existing prefix
            document.title = `[${prefix}] ${originalTitle}`;
        }
    }

    /**
     * Observes relevant DOM elements for changes and updates the title when necessary.
     */
    function observeTitleChanges() {
        const observer = new MutationObserver(() => {
            updateTitle(); // Debounced updates for performance
        });

        // Observe specific elements relevant to duration changes
        const targetNodes = [document.body, document.getElementById('sponsorBlockDurationAfterSkips')];
        targetNodes.forEach((node) => {
            if (node) {
                observer.observe(node, { childList: true, subtree: true });
            }
        });
    }

    /**
     * Monitors URL changes and triggers updates as necessary.
     */
    function monitorURLChanges() {
        let lastURL = location.href;

        const checkURLChange = () => {
            if (location.href !== lastURL) {
                lastURL = location.href;
                updateTitle(); // Update title on navigation
            }
        };

        // Intercept pushState and popstate for robust URL change detection
        window.addEventListener('popstate', checkURLChange);
        const originalPushState = history.pushState;
        history.pushState = function (...args) {
            originalPushState.apply(this, args);
            checkURLChange();
        };
    }

    // Initialize the script
    function init() {
        updateTitle(); // Initial title update
        observeTitleChanges(); // Start observing relevant DOM changes
        monitorURLChanges(); // Watch for navigation
    }

    if (location.hostname === 'www.youtube.com') {
        init();
    }
})();
