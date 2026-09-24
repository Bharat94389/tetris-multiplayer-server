const historyList = document.getElementById('historyList');
const lobbyError = document.getElementById('lobbyError');

const showLobbyError = (message) => {
    lobbyError.textContent = message;
    lobbyError.classList.remove('hidden');
};

const handleApiError = (err) => {
    if (err.status === 401) {
        return logout();
    }
    showLobbyError(err.message);
};

const STATUS_LABELS = {
    WAITING: 'Waiting',
    IN_PROGRESS: 'Live',
    COMPLETED: 'Finished',
};

const formatDate = (value) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return '';
    }
    return date.toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    });
};

// Accepts a raw game ID or a full game link like https://host/game/<id>
const parseGameId = (value) => {
    const trimmed = value.trim();
    const match = trimmed.match(/\/game\/([^/?#\s]+)/);
    if (match) {
        return match[1];
    }
    return /^[\w-]+$/.test(trimmed) ? trimmed : null;
};

const renderHistory = (games) => {
    historyList.innerHTML = '';
    if (!games.length) {
        historyList.innerHTML =
            '<li class="empty-state">No games yet. Create one to get started!</li>';
        return;
    }

    games
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .forEach((game) => {
            const status = game.status || 'WAITING';
            const host = game.owner === userDetails.username ? 'You' : game.owner;
            const li = document.createElement('li');
            li.innerHTML = `
                <a class="history-item" href="/game/${encodeURIComponent(game.gameId)}">
                    <span class="mono">${escapeHtml(game.gameId)}</span>
                    <span class="history-host">Host: ${escapeHtml(host)}</span>
                    <span class="chip chip-${status.toLowerCase()}">${escapeHtml(STATUS_LABELS[status] || status)}</span>
                    <time>${escapeHtml(formatDate(game.createdAt))}</time>
                </a>`;
            historyList.appendChild(li);
        });
};

const loadHistory = async () => {
    try {
        const games = await api('GET', '/api/game');
        renderHistory(games || []);
    } catch (err) {
        historyList.innerHTML = '<li class="empty-state">Could not load your games.</li>';
        handleApiError(err);
    }
};

if (userDetails) {
    document.getElementById('welcome').textContent = `Welcome, ${userDetails.username}`;
    document.getElementById('topbarUser').textContent = userDetails.email;
    document.getElementById('logoutButton').addEventListener('click', logout);

    const newGameButton = document.getElementById('newGame');
    newGameButton.addEventListener('click', async () => {
        newGameButton.disabled = true;
        newGameButton.textContent = 'Creating…';
        try {
            const game = await api('POST', '/api/game');
            window.location = `/game/${encodeURIComponent(game.gameId)}`;
        } catch (err) {
            newGameButton.disabled = false;
            newGameButton.textContent = 'Create game';
            handleApiError(err);
        }
    });

    document.getElementById('joinForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const gameId = parseGameId(document.getElementById('joinInput').value);
        if (!gameId) {
            return showLobbyError('That does not look like a valid game link or ID.');
        }
        window.location = `/game/${encodeURIComponent(gameId)}`;
    });

    loadHistory();
}
