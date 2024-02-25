document.getElementById('welcome').innerHTML = `Welcome ${userDetails.username}`;

document.getElementById('newGame').addEventListener('click', async () => {
    try {
        const res = await axios.post(
            '/api/game',
            {},
            { headers: { Authorization: `Bearer ${token}` } }
        );
        const div = document.createElement('div');
        div.innerHTML = res.data.gameId;
        div.addEventListener('click', () => {
            window.location = `game/${res.data.gameId}`;
        });
        document.getElementById('historyContainer').appendChild(div);

        window.location = `game/${res.data.gameId}`;
    } catch (err) {
        console.log(err);
    }
});

window.onload = async () => {
    try {
        const res = await axios.get('/api/game', { headers: { Authorization: `Bearer ${token}` } });
        const history = res.data;

        history.forEach((h) => {
            const div = document.createElement('div');
            div.innerHTML = h.gameId;
            div.addEventListener('click', () => {
                window.location = `game/${h.gameId}`;
            });
            document.getElementById('historyContainer').appendChild(div);
        });
    } catch (err) {
        console.log(err);
    }
};
