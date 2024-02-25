const token = localStorage.getItem('jwt');

if (!token) {
    window.location = '/login';
}

const payload = JSON.parse(atob(token.split('.')[1]));
if (payload.exp > new Date().getTime()) {
    window.location = '/login';
}

const userDetails = {
    username: payload.username,
    email: payload.email,
};
