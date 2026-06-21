const enterScreen = document.getElementById('enter-screen');
const bioCard = document.getElementById('bio-card');
const bgMusic = document.getElementById('bg-music');
const volumeSlider = document.getElementById('volume-slider');
const canvasVis = document.getElementById('visualizer');
const ctxVis = canvasVis.getContext('2d');

let audioCtx, analyser, source;

canvasVis.width = 300;
canvasVis.height = 35;

// --- 1. Вход, Музыка и Визуализатор ---
enterScreen.addEventListener('click', () => {
    enterScreen.style.opacity = '0';
    
    try {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            analyser = audioCtx.createAnalyser();
            source = audioCtx.createMediaElementSource(bgMusic);
            
            source.connect(analyser);
            analyser.connect(audioCtx.destination);
            
            analyser.fftSize = 64; 
            analyser.smoothingTimeConstant = 0.85; 
            
            drawVisualizer();
        }
    } catch (e) {
        console.warn("Визуализатор отключен (запуск без веб-сервера).");
    }

    setTimeout(() => {
        enterScreen.style.display = 'none';
        bioCard.classList.add('visible');
        bgMusic.volume = volumeSlider.value;
        
        bgMusic.play().catch(error => {
            console.error("Автоплей заблокирован:", error);
        });
    }, 800); // Чуть увеличил задержку для плавности
});

volumeSlider.addEventListener('input', (e) => {
    bgMusic.volume = e.target.value;
});

function drawVisualizer() {
    requestAnimationFrame(drawVisualizer);
    if (!analyser) return;
    
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteFrequencyData(dataArray);
    
    ctxVis.clearRect(0, 0, canvasVis.width, canvasVis.height);
    
    const bars = bufferLength / 1.5; 
    const barWidth = (canvasVis.width / bars) - 2;
    let x = 0;
    
    for (let i = 0; i < bars; i++) {
        const barHeight = (dataArray[i] / 255) * canvasVis.height;
        ctxVis.fillStyle = '#999999'; // Более красивый серый цвет для столбиков
        
        ctxVis.beginPath();
        if (ctxVis.roundRect) {
            ctxVis.roundRect(x, canvasVis.height - barHeight, barWidth, barHeight, 4);
        } else {
            ctxVis.fillRect(x, canvasVis.height - barHeight, barWidth, barHeight);
        }
        ctxVis.fill();
        
        x += barWidth + 2;
    }
}

// --- 2. Интеграция Discord ---
const DISCORD_USER_ID = '1423390379587408015'; 

async function fetchDiscordStatus() {
    try {
        const response = await fetch(`https://api.lanyard.rest/v1/users/${DISCORD_USER_ID}`);
        const data = await response.json();

        if (data.success) {
            const user = data.data.discord_user;
            const presence = data.data;

            document.getElementById('dc-avatar').src = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`;
            document.getElementById('dc-name').textContent = user.global_name || user.username;

            const statusColor = {
                online: '#23a559',
                idle: '#f0b232',
                dnd: '#f23f43',
                offline: '#80848e'
            };
            document.getElementById('dc-status').style.background = statusColor[presence.discord_status];

            let activityText = 'Ничего не делает';
            if (presence.activities.length > 0) {
                const customStatus = presence.activities.find(a => a.type === 4);
                const gameStatus = presence.activities.find(a => a.type === 0);
                
                if (gameStatus) {
                    activityText = `Играет в ${gameStatus.name}`;
                } else if (customStatus && customStatus.state) {
                    activityText = customStatus.state;
                }
            }
            document.getElementById('dc-activity').textContent = activityText;
        }
    } catch (error) {
        console.error('Ошибка загрузки Discord:', error);
        document.getElementById('dc-activity').textContent = 'Не удалось загрузить';
    }
}

if (DISCORD_USER_ID !== '1423390379587408015') {
    fetchDiscordStatus();
    setInterval(fetchDiscordStatus, 15000);
}

// --- 3. Интерактивные частицы ---
const canvas = document.getElementById('particles');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let mouse = { x: null, y: null };
window.addEventListener('mousemove', (event) => {
    mouse.x = event.x;
    mouse.y = event.y;
});
window.addEventListener('mouseout', () => {
    mouse.x = null;
    mouse.y = null;
});

const particlesArray = [];
class Particle {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 0.5;
        this.speedY = Math.random() * 1 + 0.2;
        this.speedX = (Math.random() - 0.5) * 0.5;
    }
    update() {
        if (mouse.x != null && mouse.y != null) {
            let dx = mouse.x - this.x;
            let dy = mouse.y - this.y;
            let distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 120) {
                this.x -= dx / 15;
                this.y -= dy / 15;
            }
        }

        this.y += this.speedY;
        this.x += this.speedX;

        if (this.y > canvas.height || this.x > canvas.width || this.x < 0) {
            this.y = -10;
            this.x = Math.random() * canvas.width;
        }
    }
    draw() {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

for (let i = 0; i < 100; i++) {
    particlesArray.push(new Particle());
}

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particlesArray.forEach(p => {
        p.update();
        p.draw();
    });
    requestAnimationFrame(animateParticles);
}
animateParticles();

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});
