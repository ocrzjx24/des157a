(function() {
    'use strict';

    // DOM elements
    var card = document.querySelector('#tilt-card');
    var inner = document.querySelector('#card-inner');
    var img = document.querySelector('#card-img');
    var tutorial = document.querySelector('#tutorial');

    // tilt and depth settings
    var maxTilt = 50;
    var depth = 30;
    var rect, bgDiv = null, fadeTimeout = null;
    var currentIndex = 0, tutorialDismissed = false;

    // image array (bw and color vars)
    var images = [
        { bw: 'images/brotherep.jpg', color: 'images/brotherep-color.jpg' },
        { bw: 'images/bigcliffson.jpg', color: 'images/bigcliffson-color.jpg' },
        { bw: 'images/alandvcx.jpg', color: 'images/alandvcx-color.jpg' },
        { bw: 'images/dragonseye.jpg', color: 'images/dragonseye-color.jpg' },
        { bw: 'images/walker.jpg', color: 'images/walker-color.jpg' }
    ];

    // update tilt and bg pos
    // inspired by code found online
    function update(e) {
        if (!rect) rect = card.getBoundingClientRect();
        var x = (e.clientX - rect.left) / rect.width - 0.5;
        var y = (e.clientY - rect.top) / rect.height - 0.5;

        inner.style.transform = 'rotateX(' + (y * maxTilt) + 'deg) rotateY(' + (-x * maxTilt) + 'deg)';
        img.style.transform = 'translateZ(' + depth + 'px) scale(1)';

        if (bgDiv) {
            var px = x + 0.5;
            var py = y + 0.5;
            bgDiv.style.backgroundPosition = (px * 100) + '% ' + (py * 100) + '%';
        }
    }

    // create or show bg
    function createBg() {
        if (fadeTimeout) {
            clearTimeout(fadeTimeout);
            fadeTimeout = null;
        }
        if (bgDiv) {
            bgDiv.style.opacity = '1';
            return;
        }

        bgDiv = document.createElement('div');
        bgDiv.className = 'background'; // css styling for bg img
        bgDiv.style.backgroundImage = "url('" + images[currentIndex].color + "')";
        document.body.appendChild(bgDiv);

        requestAnimationFrame(function() { bgDiv.style.opacity = '1'; });
    }

    // reset tilt and hide bg
    function reset() {
        inner.style.transform = '';
        img.style.transform = 'translateZ(' + depth + 'px)';

        if (bgDiv) {
            bgDiv.style.opacity = '0';
            fadeTimeout = setTimeout(function() {
                if (bgDiv && bgDiv.parentNode) bgDiv.parentNode.removeChild(bgDiv);
                bgDiv = null;
                fadeTimeout = null;
            }, 600);
        }

        rect = null;
    }

    // cycle to next img
    function nextImage() {
        currentIndex = (currentIndex + 1) % images.length;
        var next = images[currentIndex];

        if (!tutorialDismissed && tutorial) {
            tutorial.style.opacity = '0';
            tutorialDismissed = true;
            setTimeout(function() { tutorial.remove(); }, 1000);
        }

        // fade transition
        img.style.transition = 'opacity 0.5s ease';
        img.style.opacity = '0';
        if (bgDiv) bgDiv.style.opacity = '0';

        setTimeout(function() {
            img.style.backgroundImage = "url('" + next.bw + "')";
            if (bgDiv) bgDiv.style.backgroundImage = "url('" + next.color + "')";
            requestAnimationFrame(function() {
                img.style.opacity = '1';
                if (bgDiv) bgDiv.style.opacity = '1';
            });
        }, 500);
    }

    // event listeners
    card.addEventListener('mouseenter', createBg);
    card.addEventListener('mousemove', function(e) { update(e); });
    card.addEventListener('mouseleave', reset);
    card.addEventListener('click', nextImage);

})();
