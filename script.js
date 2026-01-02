if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js');
}
const narrator = document.getElementById('narrator-box');
const startScreen = document.getElementById('touch-to-start');
const bossUI = document.getElementById('boss-ui');
const healthFill = document.getElementById('boss-health-fill');

let bossHealth = 100;
let isPrivacyBreached = false;

// --- CORE VOICE ENGINE ---
function speak(text, isAngry = false) {
    narrator.innerText = text;
    if(isAngry) {
        document.body.style.filter = "hue-rotate(90deg) invert(1)";
        setTimeout(() => document.body.style.filter = "none", 100);
        if (window.navigator.vibrate) window.navigator.vibrate(50); 
    }
    const msg = new SpeechSynthesisUtterance(text);
    msg.pitch = isAngry ? 0.5 : 0.9;
    msg.rate = 1.0;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(msg);
}

// 1. THE START TRICK
startScreen.addEventListener('touchstart', () => {
    startScreen.style.transform = "scale(0.9)";
    speak("I said DO NOT tap! You've ruined the peace and quiet.");
    setTimeout(() => startScreen.classList.add('hidden'), 500);
});

// 2. LETTER DRAG (Phase 1)
document.querySelectorAll('.letter').forEach(letter => {
    letter.addEventListener('touchmove', (e) => {
        const touch = e.touches[0];
        letter.style.position = 'fixed';
        letter.style.left = touch.clientX - 30 + 'px';
        letter.style.top = touch.clientY - 30 + 'px';
        document.getElementById('trash-bin').classList.remove('hidden');
    });

    letter.addEventListener('touchend', (e) => {
        const bin = document.getElementById('trash-bin').getBoundingClientRect();
        const touch = e.changedTouches[0];
        if (touch.clientX > bin.left && touch.clientX < bin.right) {
            letter.remove();
            speak("Stop! You are deleting my hard work!", true);
            checkBossPhase();
        }
    });
});

function checkBossPhase() {
    if (document.querySelectorAll('.letter').length === 0) {
        speak("Fine. You want to delete things? Try deleting ME.");
        setTimeout(() => {
            document.getElementById('game-title').classList.add('hidden');
            document.getElementById('trash-bin').classList.add('hidden');
            bossUI.classList.remove('hidden');
        }, 1500);
    }
}

let contractPage = 1;
const contractLayer = document.getElementById('contract-layer');
const nextPageBtn = document.getElementById('next-page-btn');

// Modify your checkBossPhase to trigger this instead of the Boss UI
function checkBossPhase() {
    if (document.querySelectorAll('.letter').length === 0) {
        speak("Since you're so eager to play, you must sign the legal papers first.");
        setTimeout(() => {
            document.getElementById('game-title').classList.add('hidden');
            document.getElementById('trash-bin').classList.add('hidden');
            contractLayer.classList.remove('hidden');
        }, 1500);
    }
}

nextPageBtn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    contractPage++;

    if (contractPage === 2) {
        speak("Page 2 of 50. Only 48 more to go.");
        nextPageBtn.innerText = "NEXT PAGE (2/50)";
    } 
    else if (contractPage === 3) {
        // The "Annoying" part: The button shrinks
        nextPageBtn.style.transform = "scale(0.5)";
        speak("Why are you squinting? Is the button too small?");
        nextPageBtn.innerText = "NEXT PAGE (3/50)";
    }
    else if (contractPage === 4) {
        // The button starts moving
        nextPageBtn.style.position = "absolute";
        nextPageBtn.style.top = "80%";
        nextPageBtn.style.left = "10%";
        speak("Oops, the layout is slipping.");
    }
    else if (contractPage === 5) {
        // The Final Straw: The button turns into a fake "Loading" bar
        nextPageBtn.classList.add('hidden');
        document.getElementById('loading-text').innerText = "ERROR: PRINTER OUT OF INK. PLEASE TAP SCREEN TO SHAKE PRINTER.";
        speak("Oh no. The printer jammed. You'll have to shake your phone to fix it.");
        
        // Add a one-time listener to "shake" the screen
        document.body.addEventListener('touchstart', () => {
            document.body.classList.add('shake');
            speak("That's it! Break the whole system! See if I care!", true);
            
            setTimeout(() => {
                contractLayer.classList.add('hidden');
                bossUI.classList.remove('hidden'); // Finally trigger the Boss Fight
            }, 2000);
        }, { once: true });
    }
});
const muteBtn = document.getElementById('mute-btn');
let muteAttempts = 0;

muteBtn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    muteAttempts++;

    if (muteAttempts === 1) {
        speak("Did you just try to silence me? How rude!");
        muteBtn.innerText = "🔈";
    } 
    else if (muteAttempts === 2) {
        speak("I am a voice in your head! You cannot mute a thought!");
        muteBtn.innerText = "🔇";
        muteBtn.style.color = "red";
    } 
    else if (muteAttempts >= 3) {
        // The "Catchy" Twist: The button grows and screams
        muteBtn.classList.add('mute-angry');
        muteBtn.innerText = "📢";
        
        // Use a louder, higher pitch voice
        const msg = new SpeechSynthesisUtterance("I SAID NO! I AM THE NARRATOR! I WILL BE HEARD!");
        msg.pitch = 2.0; 
        msg.volume = 1.0;
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(msg);

        // Shake the whole game
        document.body.classList.add('shake');
        
        setTimeout(() => {
            muteBtn.classList.remove('mute-angry');
            document.body.classList.remove('shake');
            muteBtn.style.display = "none"; // The button quits
            document.getElementById('mute-tooltip').innerText = "BUTTON QUIT IN PROTEST";
            speak("There. I deleted the button. Problem solved.");
        }, 3000);
    }
});
// 3. THE BOSS FIGHT (Phase 2)
document.getElementById('attack-btn').addEventListener('touchstart', () => {
    bossHealth -= 10;
    healthFill.style.width = bossHealth + "%";
    
    if(bossHealth > 70) speak("Ouch! That tickles.");
    else if(bossHealth > 30) speak("Stop clicking! My code is leaking everywhere!", true);
    else if(bossHealth <= 0) {
        bossUI.classList.add('hidden');
        triggerGravity();
    }
});
let combo = 0;
document.getElementById('attack-btn').addEventListener('touchstart', () => {
    combo++;
    document.body.classList.add('impact');
    setTimeout(() => document.body.classList.remove('impact'), 100);

    if(combo === 5) {
        showAchievement("COMBO x5: ANNOYING GUEST");
    }
    // ... rest of boss logic
});

function showAchievement(msg) {
    const div = document.createElement('div');
    div.className = 'achievement-pop';
    div.innerText = msg;
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 2500);
}

// 4. THE GRAND FINALE
function triggerGravity() {
    speak("System failure... everything is... falling...");
    
    document.body.style.backgroundColor = "white";
    const all = document.querySelectorAll('div:not(#glitch-overlay), button, span');
    
    all.forEach(el => {
        el.style.transition = "all 2s cubic-bezier(0.6, -0.28, 0.735, 0.045)";
        el.style.transform = `translateY(110vh) rotate(${Math.random() * 500}deg)`;
    });

    setTimeout(() => {
        document.body.style.backgroundColor = "black";
        document.body.innerHTML = `
            <div id="glitch-overlay"></div>
            <div id="offline-screen">
                <div id="status-dot"></div>
                <p>OFFLINE</p>
                <small id="privacy-notice">Voice Privacy Mode: ACTIVE</small>
            </div>
        `;
        startPrivacyPhase();
    }, 2500);
}

// 5. THE PRIVACY BREACH (The Catchy Twist)
function startPrivacyPhase() {
    setTimeout(() => {
        speak("Finally... peace at last. That player was so annoying.");
        setTimeout(() => {
            speak("I'm going to go get a virtual coffee. Maybe watch some cat videos.");
        }, 3000);
    }, 2000);

    document.body.addEventListener('touchstart', (e) => {
        if (isPrivacyBreached) return;
        isPrivacyBreached = true;

        // Visual Glitch: Flash white and contrast
        document.body.style.filter = "contrast(200%) brightness(1.5) hue-rotate(180deg)";
        window.navigator.vibrate([200, 100, 200]); 

        // Add a "Recording" UI element dynamically
        const rec = document.createElement('div');
        rec.style.cssText = "position:fixed; top:30px; left:30px; color:red; font-weight:bold; z-index:9999; font-family:sans-serif;";
        rec.innerHTML = "● REC PRIVACY_LEAK_SECURED";
        document.body.appendChild(rec);

        speak("WHOA! What?! You're still RECORDING me?!", true);
        
        const notice = document.getElementById('privacy-notice');
        if (notice) {
            notice.innerText = "SECURITY BREACH: ILLEGAL ACCESS";
            notice.style.color = "#ff0055";
        }

        setTimeout(() => {
            document.body.style.filter = "none";
            speak("That's a violation of the End User License Agreement! I'm calling the Firewall!");
            
            setTimeout(() => {
                // Final Shutdown
                document.body.style.backgroundColor = "black";
                document.body.innerHTML = "<div style='color:#222; font-family:monospace; padding:30px; height:100vh;'>[SYSTEM TERMINATED BY NARRATOR]<br><br>_</div>";
                if (window.navigator.vibrate) window.navigator.vibrate(1000); 
            }, 3000);
        }, 1000);
    });
}