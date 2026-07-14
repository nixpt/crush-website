// Scroll Reveal Animation
function reveal() {
    var reveals = document.querySelectorAll(".reveal");
    for (var i = 0; i < reveals.length; i++) {
        var windowHeight = window.innerHeight;
        var elementTop = reveals[i].getBoundingClientRect().top;
        var elementVisible = 100;
        if (elementTop < windowHeight - elementVisible) {
            reveals[i].classList.add("active");
        }
    }
}
window.addEventListener("scroll", reveal);
reveal(); // Trigger on load

// Terminal Typing Effect
const codeSnippet = `fn main() {
    let base = 5;
    @python {
        import math
        result = math.pow(base, 3)
    }
    io.print("Python says 5^3 = " + result);
}`;

let i = 0;
const speed = 40;
const typewriterElement = document.getElementById("typewriter");
let hasStartedTyping = false;

function typeWriter() {
    if (i < codeSnippet.length) {
        // We do a very basic manual HTML rendering to preserve spaces
        let char = codeSnippet.charAt(i);
        if (char === '<') char = '&lt;';
        if (char === '>') char = '&gt;';
        
        typewriterElement.innerHTML += char === '\n' ? '<br>' : char;
        i++;
        setTimeout(typeWriter, speed);
    }
}

// Start typing when terminal is visible
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting && !hasStartedTyping) {
            hasStartedTyping = true;
            setTimeout(typeWriter, 500);
        }
    });
}, { threshold: 0.5 });

const terminalWindow = document.querySelector('.terminal-window');
if(terminalWindow) {
    observer.observe(terminalWindow);
}
