import styled from "styled-components";

export const NotificationsRoot = styled.div`
    position: relative;
`;

export const NotificationsButton = styled.button`
    min-width: 3rem;
    height: 42px;
    border: 1px solid rgba(25, 25, 112, 0.16);
    border-radius: 18px;
    background: linear-gradient(180deg, #ffffff 0%, #f8f8ff 100%);
    color: #191970;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.35rem 0.8rem;
    cursor: pointer;
    box-shadow: 0 10px 24px rgba(25, 25, 112, 0.08);
    font-weight: 700;

    svg {
        font-size: 1.1rem;
    }
`;

export const Badge = styled.span`
    min-width: 1.25rem;
    height: 1.25rem;
    padding: 0 0.35rem;
    border-radius: 999px;
    background: #b42318;
    color: #fff;
    font-size: 0.72rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    line-height: 1;
`;

export const NotificationsPanel = styled.div`
    position: absolute;
    top: calc(100% + 0.55rem);
    right: 0;
    width: min(28rem, 90vw);
    background: #ffffff;
    border: 1px solid rgba(25, 25, 112, 0.12);
    border-radius: 14px;
    box-shadow: 0 18px 42px rgba(0, 0, 0, 0.12);
    overflow: hidden;
    z-index: 1400;
    opacity: ${(props) => (props.$isOpen ? 1 : 0)};
    transform: ${(props) => (props.$isOpen ? "scale(1) translateY(0)" : "scale(0.96) translateY(-10px)")};
    visibility: ${(props) => (props.$isOpen ? "visible" : "hidden")};
    pointer-events: ${(props) => (props.$isOpen ? "auto" : "none")};
    transition:
        opacity 0.22s cubic-bezier(0.4, 0, 0.2, 1),
        transform 0.22s cubic-bezier(0.4, 0, 0.2, 1),
        visibility 0.22s cubic-bezier(0.4, 0, 0.2, 1);

    @media (max-width: 720px) {
        position: fixed;
        top: 4.25rem;
        right: 0.75rem;
        left: 0.75rem;
        width: auto;
    }
`;

export const NotificationsHeader = styled.div`
    padding: 0.9rem 1rem;
    border-bottom: 1px solid rgba(25, 25, 112, 0.08);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
`;

export const NotificationsTitle = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.2rem;

    strong {
        font-size: 0.98rem;
        color: #191970;
    }

    span {
        font-size: 0.8rem;
        color: #6a6a86;
    }
`;

export const NotificationsClose = styled.button`
    border: 0;
    background: transparent;
    color: #6a6a86;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 1rem;
    padding: 0.25rem;
`;

export const NotificationsList = styled.div`
    max-height: 26rem;
    overflow: auto;
`;

export const NotificationItem = styled.div`
    display: flex;
    gap: 0.75rem;
    align-items: flex-start;
    padding: 0.9rem 1rem;
    border-bottom: 1px solid rgba(25, 25, 112, 0.08);

    &:last-child {
        border-bottom: 0;
    }
`;

export const NotificationIcon = styled.div`
    flex-shrink: 0;
    width: 2rem;
    height: 2rem;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: ${(props) => props.$tone || "rgba(25, 25, 112, 0.08)"};
    color: ${(props) => props.$color || "#191970"};

    svg {
        font-size: 0.95rem;
    }
`;

export const NotificationContent = styled.div`
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 0.28rem;
`;

export const NotificationTopRow = styled.div`
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 0.75rem;
`;

export const NotificationTitle = styled.div`
    font-size: 0.92rem;
    font-weight: 800;
    color: #191970;
    line-height: 1.2;
`;

export const NotificationMeta = styled.div`
    font-size: 0.8rem;
    color: #5f637a;
    line-height: 1.35;
`;

export const NotificationBadge = styled.span`
    flex-shrink: 0;
    font-size: 0.72rem;
    font-weight: 700;
    padding: 0.28rem 0.5rem;
    border-radius: 999px;
    white-space: nowrap;
    background: ${(props) => props.$bg || "rgba(25, 25, 112, 0.08)"};
    color: ${(props) => props.$color || "#191970"};
`;

export const NotificationFooter = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    flex-wrap: wrap;
`;

export const NotificationTag = styled.span`
    font-size: 0.74rem;
    color: #6a6a86;
`;

export const NotificationAction = styled.button`
    border: 0;
    border-radius: 999px;
    padding: 0.45rem 0.8rem;
    cursor: pointer;
    background: #191970;
    color: #fff;
    font-size: 0.78rem;
    font-weight: 700;
    box-shadow: 0 6px 16px rgba(15, 13, 58, 0.18);

    &:hover {
        opacity: 0.95;
    }
`;

export const NotificationsEmpty = styled.div`
    padding: 1rem;
    color: #5f637a;
    font-size: 0.9rem;
`;
