const enterScreen = document.getElementById('enter-screen');
const bioCard = document.getElementById('bio-card');
const bgMusic = document.getElementById('bg-music');
const volumeSlider = document.getElementById('volume-slider');

enterScreen.addEventListener('click', () => {
    enterScreen.style.display = 'none';
    bioCard.classList.add('visible');
    bgMusic.play();
});

volumeSlider.addEventListener('input', (e) => { bgMusic.volume = e.target.value; });

const DISCORD_ID = 'ТВОЙ_DISCORD_ID_СЮДА'; // ОБЯЗАТЕЛЬНО ЗАМЕНИ НА ЦИФРЫ
async function updateDiscord() {
    try {
        const res = await fetch(`https://api.lanyard.rest/v1/users/${DISCORD_ID}`);
        const data = await res.json();
        if (data.success) {
            document.getElementById('dc-name').textContent = data.data.discord_user.username;
            document.getElementById('dc-avatar').src = `https://cdn.discordapp.com/avatars/${data.data.discord_user.id}/${data.data.discord_user.avatar}.png`;
            document.getElementById('dc-status').style.background = data.data.discord_status === 'online' ? '#23a559' : '#80848e';
            document.getElementById('dc-activity').textContent = data.data.activities[0]?.name || 'Ничего не делает';
        }
    } catch(e) { console.error(e); }
}
if(DISCORD_ID !== 'ТВОЙ_DISCORD_ID_СЮДА') { updateDiscord(); setInterval(updateDiscord, 15000); }