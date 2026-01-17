const loginService = require("../../src/services/loginService");
const funcionarioRepo = require("../../src/repositories/funcionarioRepository");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

jest.mock("../../src/repositories/funcionarioRepository");
jest.mock("bcrypt");
jest.mock("jsonwebtoken");

describe("loginService.authenticate", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should throw 400 if email or password is missing", async () => {
        await expect(loginService.authenticate("", "pass")).rejects.toMatchObject({
            message: "Email e senha são obrigatórios",
            status: 400,
        });
        await expect(loginService.authenticate("email", "")).rejects.toMatchObject({
            message: "Email e senha são obrigatórios",
            status: 400,
        });
    });

    it("should throw 401 if user not found", async () => {
        funcionarioRepo.findByEmail.mockResolvedValue(null);

        await expect(loginService.authenticate("wrong@email.com", "pass")).rejects.toMatchObject({
            message: "Credenciais inválidas",
            status: 401,
        });
    });

    it("should throw 401 if password does not match", async () => {
        const mockUser = { id_funcionario: 1, email_funcionario: "test@test.com", senha: "hashed_password" };
        funcionarioRepo.findByEmail.mockResolvedValue(mockUser);
        bcrypt.compare.mockResolvedValue(false);

        await expect(loginService.authenticate("test@test.com", "wrongpass")).rejects.toMatchObject({
            message: "Credenciais inválidas",
            status: 401,
        });
    });

    it("should return token and user info on success", async () => {
        const mockUser = {
            id_funcionario: 1,
            nome_funcionario: "Test User",
            email_funcionario: "test@test.com",
            senha: "hashed_password",
            nivel_acesso: "admin",
        };

        funcionarioRepo.findByEmail.mockResolvedValue(mockUser);
        bcrypt.compare.mockResolvedValue(true);
        jwt.sign.mockReturnValue("mocked_token");

        const result = await loginService.authenticate("test@test.com", "rightpass");

        expect(result).toHaveProperty("token", "mocked_token");
        expect(result).toHaveProperty("user");
        expect(result.user).toEqual({
            id_funcionario: 1,
            nome_funcionario: "Test User",
            nivel_acesso: "admin",
        });
    });
});
