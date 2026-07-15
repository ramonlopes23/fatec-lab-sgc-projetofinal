import styled from "styled-components";

export const Container = styled.div`
    width: 100%;
    max-width: 1220px;
    margin: 0 auto;
    padding: 1.5rem;
    box-sizing: border-box;
`;

export const PageHeader = styled.div`
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 1.25rem;

    @media (max-width: 1100px) {
        flex-direction: column;
    }
`;

export const Title = styled.h1`
    margin: 0;
    font-size: 29px;
    font-weight: 800;
    line-height: 1.05;
    color: #191970;
    letter-spacing: -0.5px;
`;

export const Subtitle = styled.p`
    margin: 0;
    color: #6b7280;
    font-size: 14px;
`;

export const PeriodChip = styled.div`
    min-width: 250px;
    padding: 0.9rem 1rem;
    border: 1px solid rgba(25, 25, 112, 0.12);
    border-radius: 14px;
    background: linear-gradient(180deg, #ffffff 0%, #f8f8ff 100%);
    box-shadow: 0 10px 24px rgba(25, 25, 112, 0.08);
    color: #191970;
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
`;

export const FilterCard = styled.section`
    background: #ffffff;
    border: 1px solid rgba(25, 25, 112, 0.1);
    border-radius: 18px;
    padding: 1rem;
    margin-bottom: 10px;
    box-shadow: 0 10px 24px rgba(15, 23, 42, 0.05);
`;

export const ReportModeTabs = styled.div`
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.75rem;
    margin-bottom: 0.85rem;
`;

export const ReportModeButton = styled.button`
    height: 44px;
    border-radius: 12px;
    border: 1px solid ${({ $active }) => ($active ? "transparent" : "rgba(25, 25, 112, 0.12)")};
    background: ${({ $active }) => ($active ? "linear-gradient(180deg, #191970 0%, #191970 100%)" : "#ffffff")};
    color: ${({ $active }) => ($active ? "#ffffff" : "#191970")};
    font-weight: 800;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    cursor: pointer;
    box-shadow: ${({ $active }) => ($active ? "0 12px 24px rgba(74, 47, 227, 0.18)" : "none")};
    transition:
        transform 0.15s ease,
        box-shadow 0.15s ease,
        background 0.15s ease;

    &:hover {
        transform: translateY(-1px);
        box-shadow: 0 10px 20px rgba(25, 25, 112, 0.08);
    }
`;

export const Actions = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

export const IconBtn = styled.button`
    width: 34px;
    height: 34px;
    border-radius: 10px;
    border: 1px solid rgba(25, 25, 112, 0.12);
    background: #ffffff;
    color: #191970;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition:
        transform 0.15s ease,
        background 0.15s ease;

    &:hover {
        transform: translateY(-1px);
        background: rgba(25, 25, 112, 0.05);
    }
`;

export const HeaderCopy = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
`;

export const PeriodChipLabel = styled.span`
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: #6b7280;
`;

export const PeriodChipValue = styled.span`
    font-size: 0.95rem;
    font-weight: 700;
    color: #191970;
`;

export const FilterCardTitle = styled.h2`
    margin: 0 0 0.5rem;
    color: #191970;
    font-size: 1rem;
`;

export const FilterHint = styled.p`
    margin: 0 0 1rem;
    font-size: 0.84rem;
    color: #6b7280;
`;

export const FilterGrid = styled.div`
    display: grid;
    grid-template-columns: minmax(0, 1.6fr) minmax(0, 0.8fr) minmax(0, 0.8fr) auto;
    gap: 12px;
    align-items: center;

    @media (max-width: 980px) {
        grid-template-columns: 1fr 1fr;
    }

    @media (max-width: 620px) {
        grid-template-columns: 1fr;
    }
`;

export const SearchWrapper = styled.div`
    position: relative;
    display: flex;
    align-items: center;
    min-width: 0;
`;

export const SearchIcon = styled.div`
    position: absolute;
    left: 14px;
    top: 50%;
    transform: translateY(-50%);
    color: #8f97b7;
    display: inline-flex;
    align-items: center;
    pointer-events: none;
`;

export const SearchField = styled.input`
    width: 100%;
    box-sizing: border-box;
    border: 1px solid rgba(31, 38, 82, 0.12);
    border-radius: 12px;
    background: #fff;
    outline: none;
    font-size: 14px;
    color: #1f2652;
    padding: 13px 14px 13px 44px;
    transition:
        border-color 0.15s ease,
        box-shadow 0.15s ease;

    &:focus {
        border-color: #191970;
        box-shadow: 0 0 0 4px rgba(74, 47, 227, 0.08);
    }

    &::placeholder {
        color: #99a0bd;
    }
`;

export const FilterRow = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.75rem;

    @media (max-width: 640px) {
        grid-template-columns: 1fr;
    }
`;

export const FilterActionRow = styled.div`
    display: flex;
    gap: 0.75rem;
    margin-top: 0.4rem;

    button {
        flex: 1;
    }
`;

export const SecondaryButton = styled.button`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    border: 1px solid rgba(25, 25, 112, 0.16);
    background: #ffffff;
    color: #191970;
    border-radius: 12px;
    height: 50px;
    padding: 0 1rem;
    font-weight: 700;
    cursor: pointer;
    transition:
        transform 0.15s ease,
        box-shadow 0.15s ease;

    &:hover {
        transform: translateY(-1px);
        box-shadow: 0 8px 18px rgba(25, 25, 112, 0.08);
    }
`;

export const PrimaryButton = styled(SecondaryButton)`
    background: linear-gradient(180deg, #2f3dc2 0%, #191970 100%);
    color: #ffffff;
    border-color: transparent;
`;

export const LayoutGrid = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1rem;
`;

export const MainColumn = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1rem;
`;

export const StatsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 0.9rem;

    @media (max-width: 1280px) {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    @media (max-width: 680px) {
        grid-template-columns: 1fr;
    }
`;

export const StatCard = styled.article`
    background: #ffffff;
    border: 1px solid rgba(25, 25, 112, 0.1);
    border-radius: 18px;
    padding: 1rem 1.05rem;
    box-shadow: 0 10px 24px rgba(15, 23, 42, 0.05);
    display: flex;
    align-items: center;
    gap: 0.9rem;
    min-height: 104px;
`;

export const StatIcon = styled.div`
    width: 52px;
    height: 52px;
    border-radius: 36px;
    display: grid;
    place-items: center;
    font-size: 1.2rem;
    color: ${({ $tone }) => {
        $tone == "#191970";
    }};
    background: ${({ $tone }) => {
        if ($tone === "success") return "linear-gradient(135deg, #6c6c8a 0%, rgba(185, 214, 196, 0.08) 100%)";
        return "linear-gradient(135deg, rgba(74,47,227,0.18) 0%, rgba(74,47,227,0.08) 100%)";
    }};
    flex: 0 0 52px;
`;

export const StatCopy = styled.div`
    display: flex;
    flex-direction: column;
    min-width: 0;
`;

export const StatLabel = styled.span`
    color: #6b7280;
    font-size: 0.82rem;
    font-weight: 600;
`;

export const StatValue = styled.strong`
    font-size: clamp(1.15rem, 2vw, 1.55rem);
    color: #191970;
    line-height: 1.1;
    margin-top: 0.15rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;

export const StatHint = styled.span`
    margin-top: 0.18rem;
    color: #8b93a7;
    font-size: 0.76rem;
`;

export const ChartsGrid = styled.div`
    display: grid;
    grid-template-columns: 1.4fr 0.95fr 1.1fr;
    gap: 0.9rem;
    align-items: stretch;

    @media (max-width: 1320px) {
        grid-template-columns: 1fr 1fr;
    }

    @media (max-width: 900px) {
        grid-template-columns: 1fr;
    }
`;

export const ChartCard = styled.section`
    background: #ffffff;
    border: 1px solid rgba(25, 25, 112, 0.1);
    border-radius: 18px;
    padding: 1rem;
    box-shadow: 0 10px 24px rgba(15, 23, 42, 0.05);
    min-height: 360px;
    display: flex;
    flex-direction: column;
`;

export const ChartHeader = styled.div`
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 0.75rem;
    margin-bottom: 0.5rem;
`;

export const ChartTitle = styled.h3`
    margin: 0;
    color: #191970;
    font-size: 1rem;
`;

export const ChartSubtitle = styled.p`
    margin: 0.15rem 0 0;
    color: #6b7280;
    font-size: 0.82rem;
`;

export const ChartBody = styled.div`
    flex: 1;
    min-height: 280px;
`;

export const Pagination = styled.div`
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 0.4rem;
    margin-top: 0.9rem;
    flex-wrap: wrap;
`;

export const PageButton = styled.button`
    min-width: 34px;
    height: 34px;
    border-radius: 10px;
    border: 1px solid ${({ $active }) => ($active ? "#191970" : "rgba(25, 25, 112, 0.14)")};
    background: ${({ $active }) => ($active ? "#191970" : "#ffffff")};
    color: ${({ $active }) => ($active ? "#ffffff" : "#191970")};
    font-weight: 700;
    cursor: pointer;
    padding: 0 0.65rem;

    &:disabled {
        opacity: 0.45;
        cursor: not-allowed;
    }
`;

export const EmptyState = styled.div`
    padding: 1rem;
    color: #6b7280;
    text-align: center;
`;

export const ExportCard = styled.section`
    background: #ffffff;
    border: 1px solid rgba(25, 25, 112, 0.1);
    border-radius: 18px;
    padding: 1rem 1.05rem;
    box-shadow: 0 10px 24px rgba(15, 23, 42, 0.05);
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 1rem;
    align-items: center;

    @media (max-width: 980px) {
        grid-template-columns: 1fr;
    }
`;

export const ExportCopy = styled.div`
    min-width: 0;
`;

export const ExportTitle = styled.h3`
    margin: 0;
    color: #191970;
    font-size: 1rem;
`;

export const ExportHint = styled.p`
    margin: 0.25rem 0 0;
    color: #6b7280;
    font-size: 0.82rem;
`;

export const ExportError = styled.p`
    margin: 0.45rem 0 0;
    color: #991b1b;
    font-size: 0.8rem;
    font-weight: 700;
`;

export const ExportActionsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(4, minmax(135px, 1fr));
    gap: 0.75rem;

    @media (max-width: 860px) {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    @media (max-width: 520px) {
        grid-template-columns: 1fr;
    }
`;

export const ExportActionButton = styled.button`
    min-height: 42px;
    border-radius: 12px;
    border: 1px solid
        ${({ $tone }) =>
            $tone === "pdf"
                ? "rgba(239, 68, 68, 0.22)"
                : $tone === "excel"
                  ? "rgba(22, 163, 74, 0.24)"
                  : $tone === "csv"
                    ? "rgba(37, 99, 235, 0.22)"
                    : "rgba(25, 25, 112, 0.16)"};
    background: ${({ $tone }) =>
        $tone === "pdf"
            ? "linear-gradient(180deg, #fff 0%, #fff5f5 100%)"
            : $tone === "excel"
              ? "linear-gradient(180deg, #fff 0%, #f0fdf4 100%)"
              : $tone === "csv"
                ? "linear-gradient(180deg, #fff 0%, #eff6ff 100%)"
                : "linear-gradient(180deg, #fff 0%, #f8f8ff 100%)"};
    color: ${({ $tone }) =>
        $tone === "pdf" ? "#b91c1c" : $tone === "excel" ? "#15803d" : $tone === "csv" ? "#1d4ed8" : "#191970"};
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0 0.9rem;
    font-weight: 800;
    cursor: pointer;
    white-space: nowrap;
    transition:
        transform 0.15s ease,
        box-shadow 0.15s ease,
        opacity 0.15s ease;

    &:hover:not(:disabled) {
        transform: translateY(-1px);
        box-shadow: 0 10px 20px rgba(25, 25, 112, 0.08);
    }

    &:disabled {
        opacity: 0.58;
        cursor: not-allowed;
    }
`;
