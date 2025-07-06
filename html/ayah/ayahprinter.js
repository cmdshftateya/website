// Constants
const API_BASE_URL = 'https://api.quran.com/api/v4';
const TRANSLATION_ID = 149; // Clear Quran
const TOTAL_SURAHS = 114;
const ATTRIBUTION = '-Dr. Mustafa Khattab, The Clear Quran';

// API Functions
async function fetchData(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
}

async function getArabicVerse(surahNumber, ayahNumber) {
    const url = `${API_BASE_URL}/quran/verses/uthmani?verse_key=${surahNumber}:${ayahNumber}`;
    const data = await fetchData(url);
    return data.verses[0].text_uthmani;
}

async function getEnglishVerse(surahNumber, ayahNumber) {
    const url = `${API_BASE_URL}/quran/translations/${TRANSLATION_ID}?verse_key=${surahNumber}:${ayahNumber}`;
    const data = await fetchData(url);
    return data.translations[0].text;
}

async function getSurahInfo(surahNumber) {
    const url = `${API_BASE_URL}/chapters/${surahNumber}?language=en`;
    const data = await fetchData(url);
    return {
        name: data.chapter.name_simple,
        verseCount: parseInt(data.chapter.verses_count)
    };
}

// Utility Functions
function convertToArabic(num) {
    const arabicDigits = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
    return num.toString().replace(/\d/g, d => arabicDigits[d]);
}

function getSurahPrefix(surahName) {
    const firstLetter = surahName[0].toLowerCase();
    return /[aeiouy]/.test(firstLetter) ? "Surat" : "Surah";
}

function parseAyahRange(ayahInput) {
    if (!isNaN(ayahInput)) {
        return { start: parseInt(ayahInput), end: parseInt(ayahInput) };
    }
    const [start, end] = ayahInput.split("-").map(Number);
    return { start, end };
}

function formatDate() {
    const date = new Date();
    return `${date.getMonth() + 1}/${date.getDate()}`;
}

// Verse Processing
async function getVerses(surahNumber, ayahInput, getVerseFunction) {
    const { start, end } = parseAyahRange(ayahInput);
    
    if (start === end) {
        return await getVerseFunction(surahNumber, start);
    }
    
    const verses = [];
    for (let i = start; i <= end; i++) {
        const verse = await getVerseFunction(surahNumber, i);
        if (getVerseFunction === getArabicVerse) {
            verses.push(`${verse} (${convertToArabic(i)})`);
        } else {
            verses.push(verse);
        }
    }
    return verses.join(" ");
}

// Validation
function validateSurah(surahNumber) {
    const surah = parseInt(surahNumber);
    if (isNaN(surah) || surah < 1 || surah > TOTAL_SURAHS) {
        throw new Error(`Invalid surah number. Please enter a number between 1 and ${TOTAL_SURAHS}.`);
    }
    return surah;
}

async function validateAyah(surahNumber, ayahInput) {
    const { start, end } = parseAyahRange(ayahInput);
    const surahInfo = await getSurahInfo(surahNumber);
    
    if (isNaN(start) || start < 1 || start > surahInfo.verseCount) {
        throw new Error(`Invalid ayah number. Please enter a number between 1 and ${surahInfo.verseCount} for ${getSurahPrefix(surahInfo.name)} ${surahInfo.name}.`);
    }
    
    if (end && (isNaN(end) || end < 1 || end > surahInfo.verseCount || end < start)) {
        throw new Error(`Invalid ayah range. Please enter a valid range between 1 and ${surahInfo.verseCount}.`);
    }
}

// Main Functions
async function generateAyahOutput(surahNumber, ayahInput) {
    try {
        const surah = validateSurah(surahNumber);
        await validateAyah(surah, ayahInput);
        
        const surahInfo = await getSurahInfo(surah);
        const arabic = await getVerses(surah, ayahInput, getArabicVerse);
        const english = await getVerses(surah, ayahInput, getEnglishVerse);
        
        const date = formatDate();
        const surahPrefix = getSurahPrefix(surahInfo.name);
        
        return [
            `Ayah of the Day, ${date}<br/><br/>`,
            `${surahPrefix} ${surahInfo.name}, Ayah ${ayahInput}<br/><br/>`,
            `${arabic}<br/><br/>`,
            `${english}<br/><br/>`,
            ATTRIBUTION
        ].join('');
        
    } catch (error) {
        console.error('Error generating ayah output:', error);
        throw error;
    }
}

// UI Functions
function showOutput(output) {
    const outputElement = document.getElementById('output');
    const copyButton = document.getElementById('copyButton');
    
    outputElement.innerHTML = output;
    outputElement.style.display = 'block';
    copyButton.style.display = 'inline-block';
}

function copyToClipboard() {
    const output = document.getElementById('output');
    const range = document.createRange();
    range.selectNode(output);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);
    document.execCommand('copy');
    window.getSelection().removeAllRanges();
    alert('Output copied to clipboard!');
}

// Event Handlers
async function printAyah(event) {
    event.preventDefault();
    
    try {
        const surahNumber = document.getElementById('surahNumber').value;
        const ayahNumber = document.getElementById('ayahNumber').value;
        
        const output = await generateAyahOutput(surahNumber, ayahNumber);
        showOutput(output);
        
    } catch (error) {
        alert(error.message);
    }
}

async function printRandomAyah() {
    try {
        const surahNumber = getRandomNumberInRange(1, TOTAL_SURAHS);
        const surahInfo = await getSurahInfo(surahNumber);
        const ayahNumber = getRandomNumberInRange(1, surahInfo.verseCount);
        
        const output = await generateAyahOutput(surahNumber, ayahNumber);
        showOutput(output);
        
    } catch (error) {
        console.error('Error generating random ayah:', error);
        alert('Error generating random ayah. Please try again.');
    }
}

async function trueAOTD() {
    try {
        const currentDate = new Date();
        const dateIndex = Math.floor(currentDate.getTime() / (24 * 60 * 60 * 1000));
        
        const surahNumber = seededRandom(dateIndex, 1, TOTAL_SURAHS);
        const surahInfo = await getSurahInfo(surahNumber);
        const ayahNumber = seededRandom(dateIndex, 1, surahInfo.verseCount);
        
        const output = await generateAyahOutput(surahNumber, ayahNumber);
        showOutput(output);
        
    } catch (error) {
        console.error('Error generating true ayah of the day:', error);
        alert('Error generating ayah of the day. Please try again.');
    }
}

// Utility Functions
function getRandomNumberInRange(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function seededRandom(seed, min, max) {
    const random = (Math.sin(seed) * 10000);
    const normalized = random - Math.floor(random);
    return Math.floor(normalized * (max - min + 1) + min);
}