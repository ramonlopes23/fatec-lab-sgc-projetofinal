import React, { useEffect, useMemo, useRef, useState } from "react";
import { FaBell, FaChevronDown, FaChevronUp, FaFileContract, FaMapMarkedAlt, FaTimes } from "react-icons/fa";
import { LuFlower2 } from "react-icons/lu";
import { useNavigate } from "react-router-dom";
import api from "../../../services/index.js";
import { formatDateDMY, parseDateValue } from "../../../utils/date";
import {
  Badge,
  NotificationAction,
  NotificationBadge,
  NotificationContent,
  NotificationFooter,
  NotificationIcon,
  NotificationItem,
  NotificationMeta,
  NotificationTag,
  NotificationTitle,
  NotificationTopRow,
  NotificationsButton,
  NotificationsClose,
  NotificationsEmpty,
  NotificationsHeader,
  NotificationsList,
  NotificationsPanel,
  NotificationsRoot,
  NotificationsTitle,
} from "./styles";

const DAY_MS = 24 * 60 * 60 * 1000;

const normalizeText = (value) => String(value || "").trim().toLowerCase();

const getDaysUntil = (deadline) => {
  const date = parseDateValue(deadline);
  if (!date) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const target = new Date(date);
  target.setHours(0, 0, 0, 0);

  const diff = target.getTime() - today.getTime();
  return Math.ceil(diff / DAY_MS);
};

const isConfirmedSepultamento = (sepultamento) => {
  const confirmed = sepultamento?.confirmado === true || String(sepultamento?.confirmado).toLowerCase() === "true";
  const concluded = String(sepultamento?.status ?? "").toLowerCase().includes("concl");
  return confirmed || concluded;
};

const buildContractNotification = (contract) => {
  const daysLeft = getDaysUntil(contract?.validade_titulo);
  if (daysLeft === null || daysLeft < 0 || daysLeft >= 30) return null;

  const status = normalizeText(contract?.status);
  if (status && !status.includes("ativo") && !status.includes("active")) return null;

  return {
    id: `contract-${contract?.id}`,
    type: "contract",
    title: contract?.nome_titular || "Contrato sem titular",
    meta: `Título ${contract?.numero_titulo || "-"} • Vencimento ${formatDateDMY(contract?.validade_titulo, "-")}`,
    tag: contract?.cemiterio || "Contrato",
    daysLeft,
    tone: daysLeft <= 7 ? "rgba(180, 35, 24, 0.12)" : "rgba(178, 106, 0, 0.12)",
    color: daysLeft <= 7 ? "#b42318" : "#b26a00",
    badgeLabel: daysLeft === 0 ? "Vence hoje" : `Vence em ${daysLeft} dia(s)` ,
    actionLabel: "Abrir contratos",
    path: "/contratos",
    icon: FaFileContract,
  };
};

const buildExumacaoNotification = (sepultamento, falecidos) => {
  if (!sepultamento || sepultamento.foi_exumado === true || !isConfirmedSepultamento(sepultamento)) return null;

  const sepultamentoDate = parseDateValue(sepultamento?.dh_sep);
  if (!sepultamentoDate) return null;

  const deadline = new Date(sepultamentoDate);
  deadline.setFullYear(deadline.getFullYear() + 3);

  const daysLeft = getDaysUntil(deadline);
  if (daysLeft === null) return null;

  const fk = sepultamento?.falecido ?? sepultamento?.falecido_id ?? sepultamento?.falecidoId;
  const falecido = falecidos.find((item) => String(item?.id) === String(fk)) || null;

  const nomeResp = falecido?.nome_resp || sepultamento?.nome_resp || "-";
  const telResp = falecido?.tel_resp || sepultamento?.tel_resp || "";

  const statusLabel = daysLeft < 0 ? "Prazo vencido" : daysLeft <= 29 ? "Em alerta" : daysLeft <= 90 ? "Próximo do prazo" : "Em acompanhamento";
  const color = daysLeft < 0 || daysLeft <= 29 ? "#b42318" : daysLeft <= 90 ? "#b26a00" : "#191970";

  return {
    id: `exumacao-${sepultamento?.id}`,
    type: "exumacao",
    title: falecido?.nome_fal || sepultamento?.nome_sep || sepultamento?.nome || "Falecido sem nome",
    meta: `Sepultamento ${formatDateDMY(sepultamento?.dh_sep, "-")} • Previsão ${formatDateDMY(deadline, "-")}`,
    tag: telResp ? `${nomeResp} • ${telResp}` : nomeResp,
    daysLeft,
    tone: daysLeft <= 29 ? "rgba(180, 35, 24, 0.12)" : "rgba(25, 25, 112, 0.08)",
    color,
    badgeLabel: statusLabel,
    actionLabel: "Abrir mapa",
    path: "/vermapa",
    icon: LuFlower2,
  };
};

/* const formatDaysLeft = (daysLeft) => {
  if (daysLeft === null) return "--";
  if (daysLeft < 0) return `${Math.abs(daysLeft)} dia(s) em atraso`;
  if (daysLeft === 0) return "Hoje";
  return `${daysLeft} dia(s)`;
}; */

export default function NotificationsDropdown() {
  const navigate = useNavigate();
  const rootRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [contratos, setContratos] = useState([]);
  const [sepultamentos, setSepultamentos] = useState([]);
  const [falecidos, setFalecidos] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);
      try {
        const [rContratos, rSepultamentos, rFalecidos] = await Promise.all([
          api.get("/contratos"),
          api.get("/sepultamentos"),
          api.get("/falecidos"),
        ]);

        if (!mounted) return;
        setContratos(Array.isArray(rContratos.data) ? rContratos.data : []);
        setSepultamentos(Array.isArray(rSepultamentos.data) ? rSepultamentos.data : []);
        setFalecidos(Array.isArray(rFalecidos.data) ? rFalecidos.data : []);
      } catch ( err)  {
        if (!mounted) return;
        setContratos([]);
        setSepultamentos([]);
        setFalecidos([]);
        console.error(err)
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();

    const handleRefresh = () => load();
    window.addEventListener("processoConfirmado", handleRefresh);
    window.addEventListener("processoCriado", handleRefresh);
    window.addEventListener("processoCriadoLocal", handleRefresh);

    return () => {
      mounted = false;
      window.removeEventListener("processoConfirmado", handleRefresh);
      window.removeEventListener("processoCriado", handleRefresh);
      window.removeEventListener("processoCriadoLocal", handleRefresh);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const notifications = useMemo(() => {
    const contractItems = contratos.map(buildContractNotification).filter(Boolean);
    const exumacaoItems = sepultamentos.map((sepultamento) => buildExumacaoNotification(sepultamento, falecidos)).filter(Boolean);

    return [...contractItems, ...exumacaoItems]
      .sort((a, b) => a.daysLeft - b.daysLeft)
      .slice(0, 5);
  }, [contratos, falecidos, sepultamentos]);

  const totalCount = useMemo(() => {
    const contractCount = contratos.map(buildContractNotification).filter(Boolean).length;
    const exumacaoCount = sepultamentos.map((sepultamento) => buildExumacaoNotification(sepultamento, falecidos)).filter(Boolean).length;
    return contractCount + exumacaoCount;
  }, [contratos, falecidos, sepultamentos]);

  const handleNavigate = (path) => {
    setIsOpen(false);
    navigate(path);
  };

  return (
    <NotificationsRoot ref={rootRef}>
      <NotificationsButton type="button" onClick={() => setIsOpen((prev) => !prev)} aria-haspopup="dialog" aria-expanded={isOpen} aria-label="Notificações">
        <FaBell />
        <Badge>{totalCount}</Badge>
        {isOpen ? <FaChevronUp /> : <FaChevronDown />}
      </NotificationsButton>

      <NotificationsPanel $isOpen={isOpen} role="dialog" aria-label="Notificações pendentes" aria-hidden={!isOpen}>
        <NotificationsHeader>
          <NotificationsTitle>
            <strong>Notificações</strong>
            <span>{loading ? "Atualizando alertas..." : `${totalCount} eventos ativos`}</span>
          </NotificationsTitle>
          <NotificationsClose type="button" onClick={() => setIsOpen(false)} aria-label="Fechar notificações">
            <FaTimes />
          </NotificationsClose>
        </NotificationsHeader>

        <NotificationsList>
          {notifications.length ? notifications.map((item) => {
            const Icon = item.icon;
            return (
              <NotificationItem key={item.id}>
                <NotificationIcon $tone={item.tone} $color={item.color}>
                  <Icon />
                </NotificationIcon>

                <NotificationContent>
                  <NotificationTopRow>
                    <NotificationTitle>{item.title}</NotificationTitle>
                    <NotificationBadge $bg={`${item.color}14`} $color={item.color}>{item.badgeLabel}</NotificationBadge>
                  </NotificationTopRow>

                  <NotificationMeta>{item.meta}</NotificationMeta>

                  <NotificationFooter>
                    <NotificationTag>{item.tag}</NotificationTag>
                    <NotificationAction type="button" onClick={() => handleNavigate(item.path)}>
                      {item.actionLabel}
                    </NotificationAction>
                  </NotificationFooter>
                </NotificationContent>
              </NotificationItem>
            );
          }) : (
            <NotificationsEmpty>Nenhuma notificação ativa no momento.</NotificationsEmpty>
          )}
        </NotificationsList>
      </NotificationsPanel>
    </NotificationsRoot>
  );
}
