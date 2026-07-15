const AUTH_MODE = import.meta.env.VITE_AUTH_MODE || "mock";

const MOCK_USERS = [
    { id: 1, username: "admin", password: "123456", name: "Administrador", role: "ADMIN" },
    { id: 2, username: "operador", password: "123456", name: "Operador", role: "USER" },
];

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

export async function loginRequest({ username, password }) {
    if (AUTH_MODE === "mock") {
        await wait(500);
        const user = MOCK_USERS.find((u) => u.username === String(username).trim() && u.password === String(password));

        if (!user) {
            throw new Error("Usuário ou senha inválidos");
        }

        return {
            accessToken: `mock-token-${user.id}-${Date.now()}`,
            user: { id: user.id, name: user.name, role: user.role, username: user.username },
        };
    }

    throw new Error("AUTH_MODE=real ainda não implementado");
}
