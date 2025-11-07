(function(){
    'use strict';

    const card = document.getElementById('tilt-card');
    const inner = document.getElementById('card-inner');
    const img = document.getElementById('card-img');
    const maxTilt = 50;
    const depth = 30;
    let rect, bgDiv = null; 

    function update(e) {
        if (!rect) rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        const rx = y * maxTilt;
        const ry = -x * maxTilt;

        inner.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
        img.style.transform = `translateZ(${depth}px) scale(1.0)`;

        if (bgDiv) {
            const px = x + 0.5;
            const py = y + 0.5;
            bgDiv.style.backgroundPosition = `${px*100}% ${py*100}%`;
        }
    }

    function createBg() {
        if (bgDiv) return; 
        bgDiv = document.createElement('div');
        bgDiv.style.position = 'fixed';
        bgDiv.style.top = 0;
        bgDiv.style.left = 0;
        bgDiv.style.width = '100vw';
        bgDiv.style.height = '100vh';
        bgDiv.style.backgroundImage = "url('./images/brotherep-color.jpg')";
        bgDiv.style.backgroundSize = '300%';
        bgDiv.style.backgroundPosition = '50% 50%';
        bgDiv.style.backgroundRepeat = 'no-repeat';
        bgDiv.style.transition = 'background-position 0.1s ease';
        bgDiv.style.zIndex = -1; 
        document.body.appendChild(bgDiv);
    }

    function reset() {
        inner.style.transform = '';
        img.style.transform = `translateZ(${depth}px)`;
        if (bgDiv) {
            document.body.removeChild(bgDiv);
            bgDiv = null;
        }
        rect = null;
    }

    card.addEventListener('mouseenter', createBg); // create once on hover
    card.addEventListener('mousemove', update);
    card.addEventListener('mouseleave', reset);
})();
