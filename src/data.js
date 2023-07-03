const apiKey = 'XXXXXXXXXXXXXX';
const baseURL = 'https://google-translate1.p.rapidapi.com/language/translate/v2';
const inputSelect = document.querySelector(".input-select");
const translateSelect = document.querySelector(".translate-select");
const userInput = document.querySelector("#user-input");
const translateInput = document.querySelector("#translate-input");
const copy = document.querySelector('.copy-btn');
const check = document.querySelector('.check-btn');

// GET ALL LANGUAGES

export default async function getAllLanguages() {
    const url = baseURL +  '/languages';
    const options = {
        method: 'GET',
        headers: {
            'Accept-Encoding': 'application/gzip',
            'X-RapidAPI-Key': apiKey,
            'X-RapidAPI-Host': 'google-translate1.p.rapidapi.com'
        }
    };

    try {
        const getLanguages = await fetch(url, options);
        const languagesResult = await getLanguages.json();
        languagesResult.data.languages.forEach(l => {
            const convertedLanguage = convertLanguage(l.language)
            inputSelect.innerHTML += `<option data-id='${l.language}'>${convertedLanguage}</option>`;
            translateSelect.innerHTML += `<option data-id='${l.language}'>${convertedLanguage}</option>`;
        });
        return languagesResult.data;
    } catch (error) {
        console.error(error);
    }
}

// CONVERT LANGUAGE TO COMPLETE STRING
function convertLanguage(languageShort) {
    const languageFull = new Intl.DisplayNames(['en'], { type: 'language' });
    return languageFull.of(languageShort);
}
 // DETECT LANGUAGE
async function detectLanguage(language) {

    const url = baseURL + '/detect';
    const options = {
        method: 'POST',
        headers: {
            'content-type': 'application/x-www-form-urlencoded',
            'Accept-Encoding': 'application/gzip',
            'X-RapidAPI-Key': apiKey,
            'X-RapidAPI-Host': 'google-translate1.p.rapidapi.com'
        },
        body: new URLSearchParams({
            q: language
        })
    };

    try {
        const detectLanguage = await fetch(url, options);
        const detectlanguageResult = await detectLanguage.json();
        const detectedLanguage = detectlanguageResult.data.detections[0][0].language;
        const convertedLanguage = convertLanguage(detectedLanguage);
        return detectedLanguage;

    } catch (error) {
        console.error(error);
    }
}
// FORM INPUT FOR TRANSLATING LANGUAGE
userInput.addEventListener("keyup", event => {
    event.preventDefault();
    const target = event.target.offsetParent.lastElementChild.lastElementChild.firstElementChild.selectedOptions[0].dataset.id;
    detectLanguage(userInput.value).then(language => {
        const translatedLanguage = translateLanguage(language, target);

        for(let items of event.target.nextElementSibling.firstElementChild.options) {
            if(language == items.dataset.id) {
                items.defaultSelected = true;
                convertLanguage(items.dataset.id)
            }     
        }
        translatedLanguage.then(data => {
            translateInput.value = data;
        })
        return translatedLanguage;
    })
    
})


// FUNCTION TO TRANSLATE LANGUAGE
async function translateLanguage(source, target) {
    const url = baseURL;
    const options = {
        method: 'POST',
        headers: {
            'content-type': 'application/x-www-form-urlencoded',
            'Accept-Encoding': 'application/gzip',
            'X-RapidAPI-Key': apiKey,
            'X-RapidAPI-Host': 'google-translate1.p.rapidapi.com'
        },
        body: new URLSearchParams({
            q: userInput.value,
            target: target,
            source: source
        })
    };

    try {
        const translatedResponse = await fetch(url, options);
        const translatedResult = await translatedResponse.json();
        const translatedText = translatedResult.data.translations[0].translatedText;
        return translatedText;
    } catch (error) {
        console.error(error);
    }

}



translateSelect.addEventListener('click', event => {
    event.preventDefault();

    let defaultSelected =  event.target.selectedOptions[0].defaultSelected;
    defaultSelected = true
    if(defaultSelected) {
        const target = event.target.selectedOptions[0].dataset.id;
        const source = translateInput.value;
        detectLanguage(source).then(src => {
            translateLanguage(src, target).then(data => {
                if(data === undefined) {
                    translateInput.value == ''; 
                } else {
                    translateInput.value = data;
                }
            })
        })
    }


})

inputSelect.addEventListener('click', event => {
    event.preventDefault();
    
    let defaultSelected =  event.target.selectedOptions[0].defaultSelected;
    defaultSelected = true
    if(defaultSelected) {
        const target = event.target.selectedOptions[0].dataset.id;
        const source = userInput.value;
        detectLanguage(source).then(src => {
            translateLanguage(src, target).then(data => {
            
                if(data === undefined) {
                    userInput.value == ''; 
                } else {
                    userInput.value = data;
                }
            })
        })
    }

})

copy.addEventListener("click", event => {
    copy.classList.add("hide");
    check.classList.remove("hide");

    setTimeout(()=> {
        check.classList.add("hide");
        copy.classList.remove("hide");
    }, 2000);
    if(event.target.id == 'copy') {
        translateInput.select();
        document.execCommand("copy");
    }
})


