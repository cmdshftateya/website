async function fetchData(url) {
    const promise = await fetch(url);
    const json = await promise.json();
    return json;
}

async function get_arabic_verse_text(surahNumber, ayahNumber) {
    const url = `https://api.quran.com/api/v4/quran/verses/uthmani?verse_key=${surahNumber}:${ayahNumber}`;
    const json = await fetchData(url);
    // console.log(json);
    return json.verses[0].text_uthmani;
}

async function get_english_verse_text(surahNumber, ayahNumber) {
    const url = `https://api.quran.com/api/v4/quran/translations/85?verse_key=${surahNumber}:${ayahNumber}`;
    const json = await fetchData(url);
    return json.translations[0].text;
}

async function surah_name_translation(surah_number) {
    const url = `https://api.quran.com/api/v4/chapters/${surah_number}?language=en`;
    const json = await fetchData(url);
    return json.chapter.name_simple;
}

async function verse_count(surah_number) {
    const url = `https://api.quran.com/api/v4/chapters/${surah_number}?language=en`;
    const json = await fetchData(url);
    return parseInt(json.chapter.verses_count);

}

function convert_to_arabic(num) {
    // Create an array of the Arabic digits
    const arabicDigits = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];

    // Convert the input number to a string
    num = num.toString();

    // Replace each English digit with its corresponding Arabic digit
    for (let i = 0; i < num.length; i++) {
        num = num.replace(/\d/, arabicDigits[num[i]]);
    }

    // Return the converted number
    return num;
}

async function arabic_output(surah_number, ayah_number) {
    if (!isNaN(ayah_number)) {
        return await get_arabic_verse_text(surah_number, ayah_number);
    } else {
        const endcaps = ayah_number.split("-");
        const start = parseInt(endcaps[0]);
        const end = parseInt(endcaps[1]);

        let verses = [];

        for (let i = start; i < end + 1; i++) {
            const verse = await get_arabic_verse_text(surah_number, i);
            verses.push(verse + " (" + convert_to_arabic(i) + ") ");
        }

        let output = "";

        for (let i = 0; i < verses.length; i++) {
            output += verses[i]
        }

        return output;
    }
}

async function english_output(surah_number, ayah_number) {
    if (!isNaN(ayah_number)) {
        return await get_english_verse_text(surah_number, ayah_number);
    } else {
        const endcaps = ayah_number.split("-");
        const start = parseInt(endcaps[0]);
        const end = parseInt(endcaps[1]);

        let verses = [];

        for (let i = start; i < end + 1; i++) {
            const verse = await get_english_verse_text(surah_number, i);
            verses.push(verse + " ");
        }

        let output = "";

        for (let i = 0; i < verses.length; i++) {
            output += verses[i]
        }

        return output;
    }
}

function is_first_letter_vowel(str) {
    // Convert the string to lowercase

    str = str[0];
    if (str.match(/[aeiouyAEIOUY]/) != null) {
        return "Surat";
    } else {
        return "Surah";
    }
}

async function surah_name(surah_number) {
    const name = await surah_name_translation(surah_number);
    const output = is_first_letter_vowel(name) + " " + name;
    return output;
}

async function ayah_printer(surah_number, ayah_number) {  
    const d = new Date();
    const daydate = (d.getMonth() + 1) + "/" + d.getDate();

    const arabic = await arabic_output(surah_number, ayah_number).then(data => {return data});

    const english = await english_output(surah_number, ayah_number).then(data => {return data});

    const surah_name = await surah_name_translation(surah_number);
    
    const line1 =  "Ayah of the Day, " + daydate + "<br/><br/>";
    const line2 = is_first_letter_vowel(surah_name) + " " + surah_name + ", Ayah " + ayah_number + "<br/><br/>";
    const line3 = arabic + "<br/><br/>";
    const line4 = english;

    const output = line1 + line2 + line3 + line4;
    
    console.log(output);
    return output;
}

function copyToClipboard() {
    let output = document.getElementById("output");
    let range = document.createRange();
    range.selectNode(output);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);
    document.execCommand("copy");
    window.getSelection().removeAllRanges();
    alert("Output copied to clipboard!"); 
}

async function printAyah() {
    
    event.preventDefault(); // prevent the form from submitting
    
    const surahNumber = document.getElementById('surahNumber').value;
    const ayahNumber = document.getElementById('ayahNumber').value;
    
    let output = "";
    
    // Check if surahNumber is valid
    if (isNaN(surahNumber) || surahNumber < 1 || surahNumber > 114) {
        alert("Invalid surah number. Please enter a number between 1 and 114.");
        return;
    }
    
    let ayahStart;
    if (isNaN(ayahNumber)) {
        ayahStart = parseInt(ayahNumber.split("-")[1]);
        console.log(ayahNumber.split("-")[1]);
    } else {
        ayahStart = parseInt(ayahNumber);
        console.log(ayahNumber);
    }

    const count = await verse_count(surahNumber);
    console.log(typeof count);

    // Check if ayahNumber is valid
    if (isNaN(ayahStart) || ayahStart < 1 || ayahStart > count) {
        const name = await surah_name(surahNumber);
        alert("Invalid ayah number. Please enter a number between 1 and " + count + " for " + name + ".")
        return;
    }
            
    output = await ayah_printer(surahNumber, ayahNumber);

    console.log(output);
    document.getElementById('output').innerHTML = output;
    document.getElementById("output").style.display = "block";
    const copyButton = document.getElementById("copyButton");
    copyButton.style.display = "inline-block";
}

function seededRandom(seed, min, max) {
    max = max || 1;
    min = min || 0;
  
    // use the seed to initialize the random number generator
    var random = (Math.sin(seed) * 10000);
    random = random - Math.floor(random);
  
    return Math.floor(random * (max - min + 1) + min);
  }
  
async function trueAOTD() {
    const currentDate = new Date(); // get the current date
    const dateIndex = Math.floor(currentDate.getTime() / (24 * 60 * 60 * 1000)); // convert to numerical index

    const surah_number = seededRandom(dateIndex, 1, 114);
    const ayah_count = await verse_count(surah_number);
    const ayah_number = seededRandom(dateIndex, 1, ayah_count);

    output = await ayah_printer(surah_number, ayah_number);
    document.getElementById('output').innerHTML = output;
    document.getElementById("output").classList.add("border");
    const copyButton = document.getElementById("copyButton");
    copyButton.style.display = "inline-block";
    document.getElementById("output").style.display = "block";
}

function getRandomNumberInRange(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}  

async function printRandomAyah() {
    const surah_number = getRandomNumberInRange(1, 114);
    const ayah_count = await verse_count(surah_number);
    const ayah_number = getRandomNumberInRange(1, ayah_count);

    output = await ayah_printer(surah_number, ayah_number);
    document.getElementById('output').innerHTML = output;
    document.getElementById("output").classList.add("border");
    const copyButton = document.getElementById("copyButton");
    copyButton.style.display = "inline-block";
    document.getElementById("output").style.display = "block";
}