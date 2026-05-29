import styled from "styled-components";

export const Container = styled.div`
	width: 100%;
	max-width: 1260px;
	margin: 0 auto;
	padding: 24px 20px 36px;
	box-sizing: border-box;
`;

export const PageHeader = styled.div`
	display: flex;
	align-items: flex-start;
	justify-content: space-between;
	gap: 16px;
	margin-bottom: 18px;

	@media (max-width: 1100px) {
		flex-direction: column;
	}
`;

export const HeaderCopy = styled.div`
	display: grid;
	gap: 6px;
`;

export const Title = styled.h1`
	margin: 0;
	color: #191970;
	font-size: 30px;
	line-height: 1.08;
	letter-spacing: -0.03em;
	font-weight: 800;
`;

export const Subtitle = styled.p`
	margin: 0;
	color: #6c7293;
	font-size: 14px;
	line-height: 1.5;
`;

export const HeaderActions = styled.div`
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	justify-content: flex-end;
	gap: 10px;
`;

export const PrimaryActionButton = styled.button`
	display: inline-flex;
	align-items: center;
	gap: 10px;
	border: 0;
	border-radius: 12px;
	padding: 13px 18px;
	background: #191970;
	color: #fff;
	font-weight: 700;
	font-size: 14px;
	cursor: pointer;
	box-shadow: 0 14px 28px rgba(25, 25, 112, 0.22);
	transition: transform 0.15s ease, box-shadow 0.15s ease, opacity 0.15s ease;

	&:hover {
		transform: translateY(-1px);
		box-shadow: 0 18px 32px rgba(25, 25, 112, 0.26);
	}

	&:disabled {
		opacity: 0.72;
		cursor: not-allowed;
		transform: none;
	}
`;

export const SecondaryButton = styled.button`
	display: inline-flex;
    height:54px;
	align-items: center;
	justify-content: center;
	gap: 8px;
	border: 1px solid rgba(25, 25, 112, 0.12);
	border-radius: 12px;
	padding: 12px 16px;
	background: #fff;
	color: #191970;
	font-weight: 700;
	font-size: 14px;
	cursor: pointer;
	transition: background 0.15s ease, border-color 0.15s ease, transform 0.15s ease;

	&:hover {
		transform: translateY(-1px);
		background: rgba(25, 25, 112, 0.04);
		border-color: rgba(25, 25, 112, 0.2);
	}
`;

export const Panel = styled.section`
	background: #fff;
	border: 1px solid rgba(31, 38, 82, 0.08);
	border-radius: 18px;
	box-shadow: 0 14px 32px rgba(22, 28, 70, 0.06);
`;

export const StatsGrid = styled.div`
	display: grid;
	grid-template-columns: repeat(4, minmax(0, 1fr));
	gap: 14px;
	margin: 18px 0 18px;

	@media (max-width: 1200px) {
		grid-template-columns: repeat(3, minmax(0, 1fr));
	}

	@media (max-width: 760px) {
		grid-template-columns: repeat(2, minmax(0, 1fr));
	}

	@media (max-width: 540px) {
		grid-template-columns: 1fr;
	}
`;

export const StatCard = styled.div`
	background: linear-gradient(180deg, #ffffff 0%, #fbfcff 100%);
	border: 1px solid rgba(31, 38, 82, 0.08);
	border-radius: 18px;
	padding: 18px;
	box-shadow: 0 10px 24px rgba(31, 38, 82, 0.04);
	display: flex;
	align-items: center;
	gap: 14px;
	min-height: 108px;
`;

export const StatIcon = styled.div`
	width: 50px;
	height: 50px;
	border-radius: 50%;
	display: inline-flex;
	align-items: center;
	justify-content: center;
	font-size: 20px;
	flex: 0 0 auto;
	color: ${({ $tone }) => {
     $tone == "#191970";
  }};
  background: ${({ $tone }) => {
    if ($tone === "success") return "linear-gradient(135deg, #6c6c8a 0%, rgba(185, 214, 196, 0.08) 100%)";
    return "linear-gradient(135deg, rgba(74,47,227,0.18) 0%, rgba(74,47,227,0.08) 100%)";
  }};
`;

export const StatCopy = styled.div`
	display: grid;
	gap: 4px;
`;

export const StatLabel = styled.span`
	font-size: 13px;
	color: #6c7293;
	font-weight: 600;
`;

export const StatValue = styled.strong`
	font-size: 26px;
	line-height: 1;
	color: #1f2652;
	font-weight: 800;
`;

export const StatHint = styled.span`
	font-size: 12px;
	color: #8d93b1;
`;

export const FiltersPanel = styled(Panel)`
	padding: 16px;
`;

export const FilterTopRow = styled.div`
	display: grid;
	grid-template-columns: minmax(0, 1fr) auto auto;
	gap: 12px;
	align-items: center;

	@media (max-width: 980px) {
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
	transition: border-color 0.15s ease, box-shadow 0.15s ease;

	&:focus {
		border-color: #191970;
		box-shadow: 0 0 0 4px rgba(25, 25, 112, 0.08);
	}

	&::placeholder {
		color: #99a0bd;
	}
`;

export const FilterGrid = styled.div`
	display: grid;
	grid-template-columns: repeat(6, minmax(0, 1fr));
	gap: 12px;
	margin-top: 14px;

	@media (max-width: 1200px) {
		grid-template-columns: repeat(3, minmax(0, 1fr));
	}

	@media (max-width: 760px) {
		grid-template-columns: repeat(2, minmax(0, 1fr));
	}

	@media (max-width: 540px) {
		grid-template-columns: 1fr;
	}
`;

export const FieldGroup = styled.label`
	display: grid;
	gap: 6px;
	min-width: 0;
`;

export const FieldLabel = styled.span`
	font-size: 12px;
	font-weight: 700;
	color: #6c7293;
`;

export const FilterField = styled.select`
	width: 100%;
	box-sizing: border-box;
	border: 1px solid rgba(31, 38, 82, 0.12);
	border-radius: 12px;
	background: #fff;
	outline: none;
	font-size: 14px;
	color: #1f2652;
	padding: 13px 14px;

	&:focus {
		border-color: #191970;
		box-shadow: 0 0 0 4px rgba(25, 25, 112, 0.08);
	}
`;

export const FilterDateField = styled.input`
	width: 100%;
	box-sizing: border-box;
	border: 1px solid rgba(31, 38, 82, 0.12);
	border-radius: 12px;
	background: #fff;
	outline: none;
	font-size: 14px;
	color: #1f2652;
	padding: 13px 14px;

	&:focus {
		border-color: #191970;
		box-shadow: 0 0 0 4px rgba(25, 25, 112, 0.08);
	}
`;

export const FilterHintRow = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 10px;
	margin-top: 14px;
	flex-wrap: wrap;
`;

export const FilterSummary = styled.div`
	color: #6c7293;
	font-size: 13px;
`;

export const TableCard = styled(Panel)`
	margin-top: 18px;
	overflow: hidden;
`;

export const TableScroller = styled.div`
	width: 100%;
	overflow: auto;
`;

export const Table = styled.table`
	width: 100%;
	min-width: 1220px;
	border-collapse: collapse;
	table-layout: fixed;
`;

export const THead = styled.thead`
	background: #fafbff;
	color: #5b5f81;
`;

export const TableTitle = styled.h3`
  margin-left: 15px;
  color: #191970;
  font-size: 1rem;
`;

export const Th = styled.th`
	padding: 14px 16px;
	font-size: 13px;
	font-weight: 700;
	text-align: left;
	color: #191970;
	border-bottom: 1px solid rgba(31, 38, 82, 0.08);
`;

export const TBody = styled.tbody`
	background: #ffffff;
`;

export const Tr = styled.tr`
	background: ${({ $index }) => ($index % 2 === 0 ? "#fff" : "#fafbff")};
	transition: background 0.12s ease, transform 0.12s ease;
	cursor: pointer;

	&:hover {
		background: #eef3ff;
	}
`;

export const Td = styled.td`
	padding: 14px 14px;
	border-bottom: 1px solid rgba(15, 23, 42, 0.06);
	color: #253045;
	font-size: 13px;
	vertical-align: middle;
	overflow: hidden;
	text-overflow: ellipsis;
`;

export const TdStack = styled.div`
	display: grid;
	gap: 2px;
`;

export const TdTitle = styled.strong`
	color: #1f2652;
	font-size: 13px;
	font-weight: 800;
`;

export const TdMeta = styled.span`
	color: #6c7293;
	font-size: 12px;
`;

export const Badge = styled.span`
	display: inline-flex;
	align-items: center;
	gap: 6px;
	min-height: 26px;
	padding: 5px 10px;
	border-radius: 999px;
	font-size: 12px;
	font-weight: 800;
	white-space: nowrap;
	border: 1px solid transparent;
	color: ${({ $tone }) => {
		if ($tone === "success") return "#1f7a43";
		if ($tone === "warning") return "#b45309";
		if ($tone === "danger") return "#b42318";
		if ($tone === "create") return "#18794e";
		if ($tone === "update") return "#0f62fe";
		if ($tone === "delete") return "#b42318";
		if ($tone === "login") return "#635bff";
		if ($tone === "logout") return "#6b7280";
		if ($tone === "export") return "#0e7490";
		if ($tone === "access") return "#a16207";
		return "#191970";
	}};
	background: ${({ $tone }) => {
		if ($tone === "success") return "rgba(22,163,74,0.12)";
		if ($tone === "warning") return "rgba(245,158,11,0.12)";
		if ($tone === "danger") return "rgba(220,38,38,0.12)";
		if ($tone === "create") return "rgba(16,185,129,0.12)";
		if ($tone === "update") return "rgba(15,98,254,0.12)";
		if ($tone === "delete") return "rgba(220,38,38,0.12)";
		if ($tone === "login") return "rgba(99,91,255,0.12)";
		if ($tone === "logout") return "rgba(107,114,128,0.12)";
		if ($tone === "export") return "rgba(14,116,144,0.12)";
		if ($tone === "access") return "rgba(245,158,11,0.12)";
		return "rgba(25,25,112,0.08)";
	}};
`;

export const ActionButton = styled.button`
	width: 36px;
	height: 36px;
	border-radius: 10px;
	border: 1px solid rgba(25, 25, 112, 0.12);
	background: #ffffff;
	color: #191970;
	display: inline-flex;
	align-items: center;
	justify-content: center;
	cursor: pointer;
	transition: transform 0.15s ease, background 0.15s ease;

	&:hover {
		transform: translateY(-1px);
		background: rgba(25, 25, 112, 0.05);
	}
`;

export const RowActionGroup = styled.div`
	display: flex;
	align-items: center;
	gap: 0.5rem;
`;

export const PaginationBar = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 12px;
	padding: 14px 16px 16px;
	flex-wrap: wrap;
`;

export const PaginationSummary = styled.div`
	color: #6c7293;
	font-size: 13px;
`;

export const PaginationButtons = styled.div`
	display: inline-flex;
	align-items: center;
	gap: 8px;
	flex-wrap: wrap;
`;

export const PaginationButton = styled.button`
	min-width: 36px;
	height: 36px;
	padding: 0 12px;
	border-radius: 10px;
	border: 1px solid ${({ $active }) => ($active ? "transparent" : "rgba(25, 25, 112, 0.12)")};
	background: ${({ $active }) => ($active ? "#191970" : "#fff")};
	color: ${({ $active }) => ($active ? "#fff" : "#191970")};
	font-weight: 800;
	font-size: 13px;
	cursor: pointer;
	transition: transform 0.15s ease, background 0.15s ease, box-shadow 0.15s ease;

	&:hover {
		transform: translateY(-1px);
		box-shadow: 0 10px 20px rgba(25, 25, 112, 0.08);
	}

	&:disabled {
		cursor: not-allowed;
		opacity: 0.55;
		box-shadow: none;
		transform: none;
	}
`;

export const EmptyState = styled.div`
	padding: 44px 24px;
	display: grid;
	justify-items: center;
	gap: 10px;
	color: #6c7293;
	text-align: center;
`;

export const EmptyTitle = styled.h3`
	margin: 0;
	font-size: 18px;
	color: #1f2652;
`;

export const EmptyText = styled.p`
	margin: 0;
	max-width: 560px;
	font-size: 14px;
	line-height: 1.5;
`;

export const DrawerOverlay = styled.div`
	position: fixed;
	inset: 0;
	background: rgba(15, 23, 42, 0.48);
	z-index: 2400;
	display: flex;
	justify-content: flex-end;
	padding-left: 18px;

	@media (max-width: 720px) {
		padding-left: 0;
	}
`;

export const DrawerPanel = styled.aside`
	width: min(560px, 100%);
	height: 100%;
	background: #fff;
	border-left: 1px solid rgba(31, 38, 82, 0.08);
	box-shadow: -30px 0 80px rgba(15, 23, 42, 0.28);
	display: flex;
	flex-direction: column;
	overflow: hidden;

	@media (max-width: 720px) {
		width: 100%;
	}
`;

export const DrawerHeader = styled.div`
	display: flex;
	align-items: flex-start;
	justify-content: space-between;
	gap: 12px;
	padding: 20px 20px 16px;
	border-bottom: 1px solid rgba(31, 38, 82, 0.08);
	background: linear-gradient(180deg, #fbfcff 0%, #ffffff 100%);
`;

export const DrawerHeaderCopy = styled.div`
	display: grid;
	gap: 6px;
`;

export const DrawerTitle = styled.h2`
	margin: 0;
	font-size: 22px;
	line-height: 1.15;
	font-weight: 800;
	letter-spacing: -0.02em;
	color: #191970;
`;

export const DrawerSubtitle = styled.p`
	margin: 0;
	font-size: 13px;
	color: #6c7293;
`;

export const DrawerBody = styled.div`
	padding: 18px 20px 22px;
	overflow: auto;
	display: grid;
	gap: 16px;
`;

export const SectionCard = styled.section`
	background: #ffffff;
	border: 1px solid rgba(31, 38, 82, 0.08);
	border-radius: 16px;
	padding: 16px;
	box-shadow: 0 10px 24px rgba(22, 28, 70, 0.04);
`;

export const SectionHeader = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 12px;
	margin-bottom: 12px;
`;

export const SectionTitle = styled.h3`
	margin: 0;
	color: #1f2652;
	font-size: 15px;
	font-weight: 800;
`;

export const SectionHint = styled.p`
	margin: 6px 0 0;
	color: #6c7293;
	font-size: 12px;
`;

export const InfoGrid = styled.div`
	display: grid;
	grid-template-columns: repeat(2, minmax(0, 1fr));
	gap: 12px;

	@media (max-width: 540px) {
		grid-template-columns: 1fr;
	}
`;

export const InfoTile = styled.div`
	border: 1px solid rgba(25, 25, 112, 0.08);
	border-radius: 14px;
	background: #fafbff;
	padding: 12px 14px;
	display: grid;
	gap: 4px;
`;

export const InfoLabel = styled.span`
	font-size: 11px;
	text-transform: uppercase;
	letter-spacing: 0.08em;
	color: #6c7293;
	font-weight: 800;
`;

export const InfoValue = styled.span`
	color: #1f2652;
	font-size: 13px;
	font-weight: 700;
	word-break: break-word;
`;

export const Timeline = styled.div`
	display: grid;
	gap: 12px;
`;

export const TimelineItem = styled.div`
	display: grid;
	grid-template-columns: 26px minmax(0, 1fr);
	gap: 12px;
	position: relative;
`;

export const TimelineRail = styled.div`
	width: 2px;
	background: linear-gradient(180deg, rgba(25,25,112,0.24) 0%, rgba(25,25,112,0.04) 100%);
	position: absolute;
	left: 11px;
	top: 20px;
	bottom: -10px;
`;

export const TimelineDot = styled.div`
	width: 12px;
	height: 12px;
	margin-top: 4px;
	border-radius: 50%;
	background: ${({ $tone }) => {
		if ($tone === "success") return "#16a34a";
		if ($tone === "warning") return "#f59e0b";
		if ($tone === "danger") return "#dc2626";
		return "#191970";
	}};
	box-shadow: 0 0 0 6px rgba(25, 25, 112, 0.06);
`;

export const TimelineBody = styled.div`
	display: grid;
	gap: 4px;
`;

export const TimelineLabel = styled.strong`
	color: #1f2652;
	font-size: 13px;
	font-weight: 800;
`;

export const TimelineText = styled.p`
	margin: 0;
	color: #6c7293;
	font-size: 13px;
	line-height: 1.45;
`;

export const TimelineMeta = styled.span`
	color: #8d93b1;
	font-size: 12px;
`;

export const ChangesList = styled.div`
	display: grid;
	gap: 12px;
`;

export const ChangeCard = styled.div`
	border-radius: 14px;
	border: 1px solid rgba(31, 38, 82, 0.08);
	overflow: hidden;
	background: #fff;
`;

export const ChangeHeader = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 10px;
	padding: 12px 14px;
	background: #f8faff;
	border-bottom: 1px solid rgba(31, 38, 82, 0.06);
`;

export const ChangeField = styled.strong`
	color: #1f2652;
	font-size: 13px;
	font-weight: 800;
`;

export const DiffGrid = styled.div`
	display: grid;
	grid-template-columns: repeat(2, minmax(0, 1fr));
	gap: 0;

	@media (max-width: 540px) {
		grid-template-columns: 1fr;
	}
`;

export const DiffCell = styled.div`
	padding: 12px 14px 14px;
	display: grid;
	gap: 4px;
	min-height: 86px;
`;

export const DiffLabel = styled.span`
	font-size: 11px;
	text-transform: uppercase;
	letter-spacing: 0.08em;
	color: #6c7293;
	font-weight: 800;
`;

export const DiffValue = styled.div`
	font-size: 13px;
	line-height: 1.45;
	font-weight: 700;
	color: ${({ $tone }) => ($tone === "before" ? "#b42318" : "#15803d")};
	background: ${({ $tone }) => ($tone === "before" ? "rgba(220,38,38,0.06)" : "rgba(22,163,74,0.06)")};
	border: 1px solid ${({ $tone }) => ($tone === "before" ? "rgba(220,38,38,0.12)" : "rgba(22,163,74,0.12)")};
	border-radius: 12px;
	padding: 10px 12px;
	word-break: break-word;
`;

export const DrawerActionRow = styled.div`
	display: flex;
	flex-wrap: wrap;
	gap: 10px;
`;

export const LinkButton = styled.button`
	display: inline-flex;
	align-items: center;
	gap: 8px;
	border-radius: 12px;
	border: 1px solid rgba(25, 25, 112, 0.12);
	background: #fff;
	color: #191970;
	font-size: 13px;
	font-weight: 800;
	padding: 11px 14px;
	cursor: pointer;
	transition: transform 0.15s ease, background 0.15s ease;

	&:hover {
		transform: translateY(-1px);
		background: rgba(25, 25, 112, 0.04);
	}
`;

export const Divider = styled.div`
	height: 1px;
	background: rgba(31, 38, 82, 0.08);
`;

