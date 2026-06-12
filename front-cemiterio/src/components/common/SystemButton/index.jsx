import MuiButton from "@mui/material/Button";

const BUTTON_COLORS = {
    confirm: {
        background: "#191970",
        color: "#fff",
        border: "#191970",
        hoverBackground: "#14145f",
    },
    delete: {
        background: "#c70000",
        color: "#fff",
        border: "#c70000",
        hoverBackground: "#a90000",
    },
    cancel: {
        background: "#fff",
        color: "#191970",
        border: "rgba(25, 25, 112, 0.28)",
        hoverBackground: "rgba(25, 25, 112, 0.04)",
    },
};

const baseSx = {
    position: "relative",
    borderRadius: "10px",
    minHeight: 10,
    px: 3,
    gap: 1,
    fontSize: 15,
    fontWeight: 500,
    textTransform: "none",
    transition: "all 0.2s ease",
    boxShadow: "rgba(0, 0, 0, 0.54) 0 3px 5px -1px,rgba(0, 0, 0, 0.07) 0 6px 10px 0,rgba(0, 0, 0, 0.24) 0 1px 18px 0",

    "&::after": {
        content: '""',
        position: "absolute",
        inset: 0,
        borderRadius: "inherit",
        zIndex: -1,
        transition: "all 0.4s ease",
    },

    "&:hover": {
        transform: "translateY(-3px)",
        boxShadow: "0 10px 20px rgba(0, 0, 0, 0.15)",

        "&::after": {
            transform: "scaleX(1.1) scaleY(1.1)",
            opacity: 0,
        },
    },

    "&:active": {
        transform: "translateY(-1px)",
        boxShadow: "0 5px 10px rgba(0, 0, 0, 0.12)",
    },

    "&:disabled": {
        opacity: 0.65,
        cursor: "not-allowed",
    },
};

function getToneSx(tone) {
    const colors = BUTTON_COLORS[tone] || BUTTON_COLORS.confirm;

    if (tone === "cancel") {
        return {
            backgroundColor: colors.background,
            color: colors.color,
            borderColor: colors.border,

            "&::after": {
                backgroundColor: colors.background,
            },

            "&:hover": {
                backgroundColor: colors.hoverBackground,
                borderColor: colors.border,
            },
        };
    }

    return {
        backgroundColor: colors.background,
        color: colors.color,
        borderColor: colors.border,

        "&::after": {
            backgroundColor: colors.background,
        },

        "&:hover": {
            backgroundColor: colors.hoverBackground,
            borderColor: colors.hoverBackground,
        },
    };
}

export default function SystemButton({
    children,
    tone = "confirm",
    variant,
    sx,
    type = "button",
    ...props
}) {
    const buttonVariant =
        variant || (tone === "cancel" ? "outlined" : "contained");

    return (
        <MuiButton
            type={type}
            variant={buttonVariant}
            sx={[
                baseSx,
                getToneSx(tone),
                ...(Array.isArray(sx) ? sx : [sx]),
            ]}
            {...props}
        >
            {children}
        </MuiButton>
    );
}