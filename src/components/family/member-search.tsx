"use client";

import ClearIcon from "@mui/icons-material/Clear";
import SearchIcon from "@mui/icons-material/Search";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import InputBase from "@mui/material/InputBase";

interface MemberSearchProps {
  search: string;
  setSearch: (value: string) => void;
  mobileLayout?: boolean;
}

export function MemberSearch({
  search,
  setSearch,
  mobileLayout = false,
}: MemberSearchProps): React.JSX.Element {
  return (
    <Box sx={{ width: "100%", display: "flex", justifyContent: "center" }}>
      <Box
        sx={{
          position: "relative",
          borderRadius: 1,
          bgcolor: "rgba(255, 255, 255, 0.16)",
          "&:hover": { bgcolor: "rgba(255, 255, 255, 0.24)" },
          width: "100%",
          maxWidth: mobileLayout ? "90%" : "50%",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            inset: "0 auto 0 0",
            width: 48,
            display: "grid",
            placeItems: "center",
            pointerEvents: "none",
          }}
        >
          <SearchIcon />
        </Box>
        <InputBase
          placeholder="Search family members"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          inputProps={{ "aria-label": "Search family members" }}
          sx={{
            color: "inherit",
            width: "100%",
            "& .MuiInputBase-input": {
              py: 1,
              pl: 6,
              pr: search ? 5.5 : 1,
            },
          }}
        />
        {search ? (
          <IconButton
            size="small"
            aria-label="Clear search"
            onClick={() => setSearch("")}
            sx={{
              position: "absolute",
              top: "50%",
              right: 6,
              transform: "translateY(-50%)",
              color: "inherit",
            }}
          >
            <ClearIcon fontSize="small" />
          </IconButton>
        ) : null}
      </Box>
    </Box>
  );
}
