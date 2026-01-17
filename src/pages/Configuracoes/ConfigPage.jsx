import React, { useState, useEffect } from "react";
import { Box, Typography, Paper, Grid, Button } from "@mui/material";
import {
  PersonOutline,
  DescriptionOutlined,
  AdminPanelSettingsOutlined,
  ChevronRight,
  BadgeOutlined,
  MailOutline,
} from "@mui/icons-material";

import AdminArea from "./ConfigComponents/AdminArea";

import AlterarSenhaDialog from "./ConfigComponents/AlterarSenhaDialog";
import AlterarEmailDialog from "./ConfigComponents/AlterarEmailDialog";
import CadastrarNovoUsuarioDialog from "./ConfigComponents/CadastrarNovoUsuarioDialog";
import EditarUsuarioDialog from "./ConfigComponents/EditarUsuarioDialog";
import ExcluirUsuarioDialog from "./ConfigComponents/ExcluirUsuarioDialog";
import VerificarCodigoDialog from "./ConfigComponents/VerificarCodigoDialog";

function InfoItem({ icon, title, value }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
      {React.cloneElement(icon, {
        sx: { fontSize: 28, color: "text.secondary" },
      })}
      <Box>
        <Typography variant="body2" color="text.secondary">
          {title}
        </Typography>
        <Typography variant="body1" fontWeight="Semi bold">
          {value}
        </Typography>
      </Box>
    </Box>
  );
}

const formatRole = (val) => {
  if (!val || val === "---") return val;

  const roleMap = {
    'ADMINISTRADOR': 'Administrador',
    'SUPER_ADMIN': 'Super Admin',
    'FUNCIONARIO': 'Funcionário',
    'FUNCION_RIO': 'Funcionário',
    'FUNCIONÁRIO': 'Funcionário'
  };

  const upperVal = String(val).toUpperCase();
  return roleMap[upperVal] || val.charAt(0).toUpperCase() + val.slice(1).toLowerCase();
};

export default function ConfigPage() {
  const [user, setUser] = useState({
    id: "",
    nome: "Carregando...",
    matricula: "---",
    cpf: "---",
    email: "---",
    role: "",
  });

  const [funcionarios, setFuncionarios] = useState([]);
  const [modalOpen, setModalOpen] = useState(null); 
  const [selectedUser, setSelectedUser] = useState(null);
  
  const [newlyCreatedUserId, setNewlyCreatedUserId] = useState(null);

  const fetchFuncionarios = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) return;

    try {
      const response = await fetch("http://localhost:4000/api/funcionario", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const normalizeRole = (r) =>
          String(r || "").toLowerCase().replace(/[^a-z0-9]+/g, "_").toUpperCase();

        const listaFormatada = data.map((f) => ({
          id: f.id_funcionario,
          nome: f.nome_funcionario,
          cpf: f.cpf_funcionario,
          matricula: f.id_funcionario.toString(),
          email: f.email_funcionario,
          role: f.nivel_acesso ? normalizeRole(f.nivel_acesso) : "FUNCIONARIO",
          rawRole: f.nivel_acesso || null,
          isEnabled: f.isenabled 
        }));
        setFuncionarios(listaFormatada);
      }
    } catch (error) {
      console.error("Erro de conexão com a API:", error);
    }
  };

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const storedData = localStorage.getItem("userData");
        const token = localStorage.getItem("authToken");

        if (storedData) {
          const parsedUser = JSON.parse(storedData);
          const id = parsedUser.id_funcionario || parsedUser.id;

          setUser({
            id: id,
            nome: parsedUser.nome_funcionario || parsedUser.nome || "---",
            matricula: id ? id.toString() : "---",
            cpf: parsedUser.cpf_funcionario || parsedUser.cpf || "---",
            email: parsedUser.email_funcionario || parsedUser.email || "---",
            role: parsedUser.nivel_acesso
              ? String(parsedUser.nivel_acesso).toLowerCase().replace(/[^a-z0-9]+/g, "_").toUpperCase()
              : "FUNCIONARIO",
          });

          if (id && token) {
            try {
              const response = await fetch(
                `http://localhost:4000/api/funcionario/id/${id}`,
                {
                  headers: { Authorization: `Bearer ${token}` },
                }
              );
              if (response.ok) {
                const fullData = await response.json();
                setUser((prev) => ({
                  ...prev,
                  nome: fullData.nome_funcionario,
                  cpf: fullData.cpf_funcionario,
                  email: fullData.email_funcionario,
                  role: fullData.nivel_acesso
                    ? String(fullData.nivel_acesso).toLowerCase().replace(/[^a-z0-9]+/g, "_").toUpperCase()
                    : prev.role,
                }));
              }
            } catch (err) {
              console.error("Erro ao buscar detalhes do usuário:", err);
            }
          }
        }
      } catch (error) {
        console.error("Erro ao ler dados do usuário:", error);
      }
    };
    loadUserData();
  }, []);

  useEffect(() => {
    if (user.role === "ADMINISTRADOR" || user.role === "SUPER_ADMIN") {
      fetchFuncionarios();
    }
  }, [user.role]);

  const handleEmailChanged = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const userDataString = localStorage.getItem("userData");
      if (!userDataString) return;
      const parsedUser = JSON.parse(userDataString);
      const id = parsedUser.id_funcionario || parsedUser.id;
      if (!id) return;

      const resp = await fetch(`http://localhost:4000/api/funcionario/id/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (resp.ok) {
        const fullData = await resp.json();
        const updatedStored = {
          ...parsedUser,
          email_funcionario: fullData.email_funcionario,
          email: fullData.email_funcionario,
        };
        localStorage.setItem("userData", JSON.stringify(updatedStored));
        setUser((prev) => ({
          ...prev,
          email: fullData.email_funcionario,
        }));
      }

      if (user.role === "ADMINISTRADOR" || user.role === "SUPER_ADMIN") {
        await fetchFuncionarios();
      }
    } catch (err) {
      console.error("Erro ao atualizar email localmente:", err);
    }
  };

  const handleOpenModal = (modalName, userToEdit = null) => {
    setSelectedUser(userToEdit);
    setModalOpen(modalName);
  };

  const handleCloseModal = () => {
    setModalOpen(null);
    setSelectedUser(null);
  };

  const handleAddUser = async (userData) => {
    const token = localStorage.getItem("authToken");
    const payload = {
      nome_funcionario: userData.nome,
      email_funcionario: userData.email,
      cpf_funcionario: userData.cpf,
      senha: userData.senha,
      nivel_acesso: userData.role === "ADMINISTRADOR" ? "Administrador" : "Funcionário",
    };
    
    const response = await fetch("http://localhost:4000/api/funcionario", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      const novo = await response.json();
      
      await fetchFuncionarios();
    
      setNewlyCreatedUserId(novo.id_funcionario);
      setModalOpen("verificarEmail");
      
    } else {
      const err = await response.json();
      throw new Error(err.error || response.statusText);
    }
  };

  const handleVerificationSuccess = () => {
    fetchFuncionarios(); 
    setNewlyCreatedUserId(null);
  };

  const handleEditUser = async (updatedData) => {
    const token = localStorage.getItem("authToken");

    const payload = {
      nome_funcionario: updatedData.nome,
      cpf_funcionario: updatedData.cpf,
      nivel_acesso:
        updatedData.role === "ADMINISTRADOR" ? "Administrador" : "Funcionário",
      senha: updatedData.senha, 
      adminId: user.id,
    };

    try {
      const response = await fetch(
        `http://localhost:4000/api/funcionario/${selectedUser.cpf}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (response.ok) {
        await fetchFuncionarios();
        alert("Usuário atualizado com sucesso!");
        handleCloseModal();
      } else {
        const err = await response.json();
        alert("Erro ao atualizar: " + (err.error || "Erro desconhecido"));
      }
    } catch (error) {
      console.error("Erro:", error);
      alert("Erro de conexão.");
    }
  };

  const handleDeleteUser = async (opts) => {
    if (!selectedUser) return;
    const token = localStorage.getItem("authToken");

    try {
      const requesterRole = (user.role || "").toUpperCase();

      if (selectedUser.id === user.id && requesterRole !== "ADMINISTRADOR" && requesterRole !== "SUPER_ADMIN") {
        const response = await fetch(
          `http://localhost:4000/api/funcionario/${selectedUser.cpf}`,
          {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.ok) {
          setFuncionarios(funcionarios.filter((f) => f.id !== selectedUser.id));
          alert("Sua conta foi removida.");
          handleCloseModal();
        } else {
          alert("Erro ao excluir usuário.");
        }
        return;
      }

      if (requesterRole === "ADMINISTRADOR" || requesterRole === "SUPER_ADMIN") {
        const adminPassword = opts?.adminPassword;
        const reason = opts?.reason;

        if (!adminPassword) {
          alert('Senha do administrador é obrigatória para confirmar a exclusão.');
          return;
        }

        if ((selectedUser.role || "").toUpperCase() === 'SUPER_ADMIN') {
          alert('Não é possível excluir um Super-Admin.');
          return;
        }

        const payload = {
          requesterId: parseInt(user.id, 10), 
          targetCpf: selectedUser.cpf,
          adminPassword,
          reason
        };

        const resp = await fetch('http://localhost:4000/api/funcionario/admin/delete', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(payload),
        });

        if (resp.ok) {
          await fetchFuncionarios();
          alert('Usuário removido com sucesso.');
          handleCloseModal();
        } else {
          const data = await resp.json().catch(() => ({}));
          alert('Erro ao excluir usuário: ' + (data.error || resp.statusText));
        }
      } 
    } catch (error) {
      console.error("Erro:", error);
      alert("Erro de conexão.");
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" fontWeight="bold" mb={4}>
        Configurações
      </Typography>

      <Typography variant="h5" mb={2}>
        Acesso
      </Typography>
      <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
        <Grid container rowSpacing={4} columnSpacing={2}>
          <Grid item xs={12} sm={6} md={4}>
            <InfoItem
              icon={<PersonOutline />}
              title="Logado como:"
              value={user.nome}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <InfoItem
              icon={<DescriptionOutlined />}
              title="Matrícula:"
              value={user.matricula}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <InfoItem icon={<BadgeOutlined />} title="CPF:" value={user.cpf} />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <InfoItem
              icon={<MailOutline />}
              title="E-mail:"
              value={user.email} 
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <InfoItem
              icon={<AdminPanelSettingsOutlined />}
              title="Nível:"
              value={formatRole(user.role)} 
            />
          </Grid>
        </Grid>
      </Paper>

      <Box mb={3} mt={5}>
        <Typography variant="h5" mb={2}>
          Segurança
        </Typography>
        <Paper
          variant="outlined"
          sx={{
            p: 3,
            borderRadius: 2,
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, maxWidth: 400, width: "100%" }}>
            <Button
              variant="contained"
              onClick={() => handleOpenModal("senha")}
              endIcon={
                <Box sx={{ bgcolor: "#F2D95C", width: 36, height: 36, borderRadius: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <ChevronRight sx={{ color: "#1F2937", fontSize: 20 }} />
                </Box>
              }
              sx={{ bgcolor: "white", color: "black", boxShadow: "none", border: "1px solid #e0e0e0", justifyContent: "space-between", p: 2, "&:hover": { bgcolor: "#f9f9f9" }, fontWeight: "bold", textTransform: "none" }}
            >
              Alterar Senha
            </Button>
            <Button
              variant="contained"
              onClick={() => handleOpenModal("email")}
              endIcon={
                <Box sx={{ bgcolor: "#F2D95C", width: 36, height: 36, borderRadius: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <ChevronRight sx={{ color: "#1F2937", fontSize: 20 }} />
                </Box>
              }
              sx={{ bgcolor: "white", color: "black", boxShadow: "none", border: "1px solid #e0e0e0", justifyContent: "space-between", p: 2, "&:hover": { bgcolor: "#f9f9f9" }, fontWeight: "bold", textTransform: "none" }}
            >
              Alterar Email
            </Button>
          </Box>
        </Paper>
      </Box>

      {(user.role === "ADMINISTRADOR" || user.role === "SUPER_ADMIN") && (
        <Box>
          <AdminArea
            funcionarios={funcionarios}
            onAddUser={() => handleOpenModal("cadastrar")}
            onEditUser={(user) => handleOpenModal("editar", user)}
            onDeleteUser={(user) => handleOpenModal("excluir", user)}
            currentUserId={user.id}
            currentUserRole={user.role}
          />
        </Box>
      )}

      <AlterarSenhaDialog
        open={modalOpen === "senha"}
        onClose={handleCloseModal}
      />
      
      <AlterarEmailDialog
        open={modalOpen === "email"}
        onClose={handleCloseModal}
        onSuccess={handleEmailChanged}
      />
      
      <CadastrarNovoUsuarioDialog
        open={modalOpen === "cadastrar"}
        onClose={handleCloseModal}
        onSave={handleAddUser}
      />

      <VerificarCodigoDialog
        open={modalOpen === "verificarEmail"}
        onClose={handleCloseModal}
        userId={newlyCreatedUserId}
        onVerificationSuccess={handleVerificationSuccess}
      />

      <EditarUsuarioDialog
        open={modalOpen === "editar"}
        onClose={handleCloseModal}
        user={selectedUser}
        onSave={handleEditUser}
      />
      
      <ExcluirUsuarioDialog
        open={modalOpen === "excluir"}
        onClose={handleCloseModal}
        user={selectedUser}
        currentUser={user}
        onConfirm={handleDeleteUser}
      />
    </Box>
  );
}