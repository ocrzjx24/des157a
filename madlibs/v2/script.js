(function() {
    'use strict';
    console.log('reading js');

    const myForm = document.querySelector('#madlib-form');
    const madlibOutput = document.querySelector('#madlib-output');
    const formData = document.querySelectorAll('input[type=text]');
    const pages = document.querySelectorAll('.form-page');
    const popup = document.querySelector('#popup');
    const closeBtn = document.querySelector('.close-btn');
    let currentPage = 1;

    // PAGE NAVIGATION
    const nextBtn = document.querySelector('.next-btn');
    const prevBtn = document.querySelector('.prev-btn');

    nextBtn.addEventListener('click', function() {
        showPage(2);
    });

    prevBtn.addEventListener('click', function() {
        showPage(1);
    });

    function showPage(pageNum) {
        pages.forEach(function(page) {
            if (parseInt(page.dataset.page) === pageNum) {
                page.classList.add('active');
            } else {
                page.classList.remove('active');
            }
        });
        currentPage = pageNum;
    }

    // FORM SUBMISSION
    myForm.addEventListener('submit', function(event) {
        event.preventDefault();
        processFormData(formData);
    });

    function processFormData(formData) {
        const words = [];
        const emptys = [];
        let counter = 0;

        for (const each of formData) {
            if (each.value) {
                words.push(each.value.trim());
            } else {
                emptys.push(counter);
            }
            counter++;
        }

        if (emptys.length > 0) {
            showErrors(formData, emptys);
        } else {
            makeMadLib(words);
        }
    }

    function showErrors(formData, emptys) {
        const eid = formData[emptys[0]].id;
        const etext = `Please fill out this field: ${eid}`;
        madlibOutput.innerHTML = `<p class="error">${etext}</p>`;
        document.querySelector(`#${eid}`).focus();

        const fieldPage = formData[emptys[0]].closest('.form-page').dataset.page;
        showPage(parseInt(fieldPage));
    }

    function makeMadLib(words) {
        const myText = `
            <h2>Today's Recipe: <strong>${words[0]} ${words[1]} ${words[2]}</strong></h2>
            <p>
            Before you start, make sure you're wearing <strong>${words[3]}</strong>. Safety first!<br>
            To begin, <strong>${words[4]}</strong> your <strong>${words[5]}</strong> for <strong>${words[6]}</strong>, or until it is <strong>${words[7]}</strong>. 
            Add in <strong>${words[8]}</strong> of <strong>${words[9]}</strong>. Stir <strong>${words[10]}</strong> until the mixture smells <strong>${words[11]}</strong>.
            Then, <strong>${words[12]}</strong> it all and serve immediately. Enjoy!
            </p>
        `;

        madlibOutput.innerHTML = myText;

        for (const each of formData) {
            each.value = '';
        }

        // show popup overlay
        popup.className = 'showing';
        document.querySelector('#page-blur').classList.add('blur');
    }

    // CLOSE POPUP
    closeBtn.addEventListener('click', function(event) {
        event.preventDefault();
        popup.className = 'hidden';
        document.querySelector('#page-blur').classList.remove('blur');
    });

    // ESC key closes popup
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            popup.className = 'hidden';
            document.querySelector('#page-blur').classList.remove('blur');
        }
    });

})();
