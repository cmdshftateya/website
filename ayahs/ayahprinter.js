async function get_arabic_verse_text(surahNumber, ayahNumber) {
    const url = `https://api.quran.com/api/v4/quran/verses/uthmani?verse_key=${surahNumber}:${ayahNumber}`;
    const response = await fetch(url);
    const data = await response.json();
    // console.log(data.verses[0].text_uthmani)
    return data.verses[0].text_uthmani;
}

async function get_english_verse_text(surahNumber, ayahNumber) {
    const url = `https://api.quran.com/api/v4/quran/translations/85?verse_key=${surahNumber}:${ayahNumber}`;
    const response = await fetch(url);
    const data = await response.json();
    return data.translations[0].text;
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

async function get_arabic(surah_number, ayah_number) {
    if (Number.isInteger(ayah_number)) {
        return await get_arabic_verse_text(surah_number, ayah_number);
    } else {
        const endcaps = ayah_number.split("-");
        const start = parseInt(endcaps[0]);
        const end = parseInt(endcaps[1]);

        let verses = "";

        for (let i = start; i < end + 1; i++) {
            const verse = await get_arabic_verse_text(surah_number, i);
            verses += verse + " (" + convert_to_arabic(i) + ") ";
        }
        // console.log(verses)
        return verses;
    }
}

async function get_english(surah_number, ayah_number) {
    if (Number.isInteger(ayah_number)) {
        return await get_english_verse_text(surah_number, ayah_number);
    } else {
        const endcaps = ayah_number.split("-");
        const start = parseInt(endcaps[0]);
        const end = parseInt(endcaps[1]);

        let verses = "";

        for (let i = start; i < end + 1; i++) {
            const verse = await get_english_verse_text(surah_number, i);
            verses += verse;
        }
        // console.log(verses)
        return verses;
    }
}

async function surah_name_translation(surah_number) {
    const url = `https://api.quran.com/api/v4/chapters/${surah_number}?language=en`;
  
    const response = await fetch(url);
    const data = await response.json();
    return data.chapter.name_simple;
}

function is_first_letter_vowel(str) {
    // Convert the string to lowercase
    str = str.toLowerCase();
  
    // Check if the first letter is a vowel
    return str[0] === "a" || str[0] === "e" || str[0] === "i" || str[0] === "o" || str[0] === "u";
}
  
async function ayah_printer(surah_number, ayah_number) {  
    const d = new Date();
    const daydate = (d.getMonth() + 1) + "/" + d.getDate();
    // console.log(datetime);
    const arabic = await get_arabic(surah_number, ayah_number);
    const english = await get_english(surah_number, ayah_number);
    const surah_name = await surah_name_translation(surah_number);

    let surah_or_surat = "";
    if (is_first_letter_vowel(surah_name)) {
        surah_or_surat = "Surat";
    } else {
        surah_or_surat = "Surah";
    }
    const output = 
        "Ayah of the Day, " +
        daydate + "\n\n" + 
        surah_or_surat + " " + surah_name + ", Ayah " + ayah_number +  "\n\n" + 
        arabic +  "\n\n" + 
        english;
    
    console.log(output);
    return output;
}

function errorChecker(surahNumber, ayahNumber) {
    const fs = require('fs');

    // Read the contents of the file into a string
    const jsonString = fs.readFileSync('quraninfo.json', 'utf8');

    // Parse the string into a JavaScript object
    const data = JSON.parse(jsonString);
    
    const surahData = data[surahNumber];
    console.log(surahData);

    if (surahNumber > 114) {
        console.log("Doesn't work");
        
    }
}

errorChecker(115,3)

