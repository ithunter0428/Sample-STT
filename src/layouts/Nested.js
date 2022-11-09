import * as React from "react";
import {
  // List,
  // ListItemIcon,
  // ListItemText,
  // ListItem,
  // ButtonBase,
  Box,
  // Divider,
} from "@material-ui/core";
// import { Voicemail, MusicNote } from "@material-ui/icons";

export default function SelectedListItem() {
  // const [selectedIndex, setSelectedIndex] = React.useState(1);

  // const handleListItemClick = (event, index) => {
  //   setSelectedIndex(index);
  // };

  return (
    <Box sx={{ width: "100%", maxWidth: 360, bgcolor: "background.paper" }}>
      {/* <List component="nav" aria-label="main mailbox folders">
        <ListItem
          component={ButtonBase}
          selected={selectedIndex === 0}
          onClick={(event) => handleListItemClick(event, 0)}
        >
          <ListItemIcon>
            <Voicemail />
          </ListItemIcon>
          <ListItemText primary="Recording +UTC" />
        </ListItem>
      </List>
      <Divider />
      <List component="nav" aria-label="secondary mailbox folder">
        <ListItem
          component={ButtonBase}
          selected={selectedIndex === 0}
          onClick={(event) => handleListItemClick(event, 0)}
        >
          <ListItemIcon>
            <MusicNote />
          </ListItemIcon>
          <ListItemText primary="Upload #1" />
        </ListItem>
      </List> */}
    </Box>
  );
}
