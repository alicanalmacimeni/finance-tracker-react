import { makeStyles } from '@material-ui/core/styles';
import { IconButton } from '@material-ui/core';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/DeleteOutlined';

export default function ActionButtons(props) {
    const { api, id, setRefresh, handleClickEdit } = props;
    const classes = useStyles();
    const handleEditClick = (event) => {
        event.stopPropagation();
        handleClickEdit(id);
    };

    const handleDeleteClick = (event) => {
        event.stopPropagation();
        const currentRows = JSON.parse(localStorage.getItem("finance-tracker")) || [];
        const newRows = currentRows.filter(el => el.id !== id);
        localStorage.setItem("finance-tracker", JSON.stringify(newRows));
        setRefresh(prev => !prev)
    };

    return (
        <div className={classes.root}>
            <IconButton
                color="inherit"
                className={classes.textPrimary}
                size="small"
                aria-label="edit"
                onClick={handleEditClick}
            >
                <EditIcon fontSize="small" />
            </IconButton>
            <IconButton
                color="inherit"
                size="small"
                aria-label="delete"
                onClick={handleDeleteClick}
            >
                <DeleteIcon fontSize="small" />
            </IconButton>
        </div>
    );
}

const useStyles = makeStyles((theme) => ({

}));