const { Router } = require("express");
const service = require("../services/planosService");

const router = Router();

router.get("/", async (req, res) => {
  try {
    const planos = await service.listAll();
    res.status(200).json(planos);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Erro ao buscar planos", error: err.message });
  }
});

router.get("/:cod_plano", async (req, res) => {
  try {
    const { cod_plano } = req.params;
    const plano = await service.getByCod(cod_plano);

    if (!plano) {
      return res.status(404).json({ message: "Plano não encontrado" });
    }

    res.status(200).json(plano);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Erro ao buscar plano", error: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const novoPlano = await service.create(req.body);
    res.status(201).json(novoPlano);
  } catch (err) {
    if (err.status === 400) {
      return res
        .status(400)
        .json({ message: err.message, details: err.details });
    }
    res
      .status(500)
      .json({ message: "Erro ao criar plano", error: err.message });
  }
});

router.put("/:cod_plano", async (req, res) => {
  try {
    const { cod_plano } = req.params;
    const planoAtualizado = await service.update(cod_plano, req.body);
    res.status(200).json(planoAtualizado);
  } catch (err) {
    if (err.status === 400) {
      return res
        .status(400)
        .json({ message: err.message, details: err.details });
    }
    res
      .status(500)
      .json({ message: "Erro ao atualizar plano", error: err.message });
  }
});

router.delete("/:cod_plano", async (req, res) => {
  try {
    const { cod_plano } = req.params;
    await service.remove(cod_plano);
    res.status(204).send();
  } catch (err) {
    res
      .status(500)
      .json({ message: "Erro ao deletar plano", error: err.message });
  }
});

module.exports = router;