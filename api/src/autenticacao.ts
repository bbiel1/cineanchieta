import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

// O segredo assina o token. Ele fica no .env e não vai para o Git.
// Sem o segredo, ninguém consegue inventar um token válido.
export const SEGREDO = process.env.JWT_SEGREDO ?? "troque-este-segredo";

// Middleware: roda antes da rota e só deixa passar quem tem token válido.
// Se o crachá estiver certo, chama next(); se não, responde 401 e a rota
// nem chega a executar.
export function exigirLogin(req: Request, res: Response, next: NextFunction): void {
  const cabecalho = req.headers.authorization;
  const token = cabecalho?.startsWith("Bearer ") ? cabecalho.slice(7) : undefined;

  if (!token) {
    res.status(401).json({ erro: "Faça login para continuar." });
    return;
  }

  try {
    const dados = jwt.verify(token, SEGREDO) as { id?: unknown };

    // Um token assinado por nós sempre traz um id numérico; a conferência
    // protege a rota de um token antigo ou com formato inesperado.
    if (typeof dados.id !== "number" || !Number.isInteger(dados.id) || dados.id <= 0) {
      throw new Error("Token sem usuário.");
    }

    res.locals.usuarioId = dados.id; // a rota lê o dono daqui
    next();
  } catch {
    res.status(401).json({ erro: "Sua sessão expirou. Entre de novo." });
  }
}

// Quem está logado nesta requisição. A página nunca manda o usuario_id:
// ele vem do token, que o navegador não consegue alterar sem quebrar a
// assinatura.
export function usuarioDe(res: Response): number {
  return res.locals.usuarioId as number;
}
