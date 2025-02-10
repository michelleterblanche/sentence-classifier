let sentences = [];
let currentSentenceIndex = 0;

// Load sentences from the backend (randomly shuffled)
async function loadSentences() {
    try {
        const response = await fetch('/api/sentences');
        if (!response.ok) throw new Error("Failed to load sentences");
        sentences = await response.json();
        loadSentence(); // Load the first sentence randomly
    } catch (error) {
        console.error("Error loading sentences:", error);
        document.getElementById('sentence').innerText = "Error loading sentences.";
    }
}

// Load a new sentence from the sentences array
function loadSentence() {
    if (currentSentenceIndex >= sentences.length) {
        document.getElementById('sentence').innerText = "All sentences have been displayed.";
        document.getElementById('correct-btn').disabled = true;
        document.getElementById('incorrect-btn').disabled = true;
        document.getElementById('exit-btn').style.display = 'block'; // Show exit button
        return;
    }
    const sentence = sentences[currentSentenceIndex];
    document.getElementById('sentence').innerText = sentence.sentence;
}

// Handle the user's answer
async function submitAnswer(isCorrect) {
    const sentence = sentences[currentSentenceIndex];

    // Send the user's answer to the backend (including the sentence ID and correctness)
    try {
        const response = await fetch('/api/submit-answer', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                sentenceId: sentence.id, // The ID of the current sentence
                isCorrect: isCorrect
            })
        });

        const result = await response.json();
        console.log(result.message); // Handle server response

        const feedbackMessage = `${isCorrect ? "You selected: Correct!" : "You selected: Incorrect!"}`;
        document.getElementById('feedback').innerText = feedbackMessage;

        setTimeout(() => {
            document.getElementById('feedback').innerText = ""; // Clear feedback
            currentSentenceIndex++; // Move to the next sentence
            loadSentence(); // Load next sentence
        }, 2000);
    } catch (error) {
        console.error('Error submitting answer:', error);
    }
}

// Event listeners for correct and incorrect buttons
document.getElementById('correct-btn').addEventListener('click', () => submitAnswer(true));
document.getElementById('incorrect-btn').addEventListener('click', () => submitAnswer(false));

// Event listener for exit button
document.getElementById('exit-btn').addEventListener('click', () => {
    alert("Thanks for participating!"); // Show a message before exit
    window.close(); // Attempt to close the window
});

// Load sentences when the page is loaded
window.onload = loadSentences;