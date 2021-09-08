import { useEffect, useState } from 'react';
import { DataGrid, GridToolbar } from '@material-ui/data-grid';
import './App.css';
import { Button, Container, Box, Modal, TextField, FormControl, FormLabel, RadioGroup, FormControlLabel, Radio, MenuItem, Select, InputLabel } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import ActionButtons from './components/ActionButtons';
import axios from 'axios';


export default function App() {
  const [openModal, setOpenModal] = useState(false);
  const [values, setValues] = useState({ activity: 'Expense', amount: '', currency: 'USD' });
  const [rows, setRows] = useState([]);
  const [refresh, setRefresh] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [total, setTotal] = useState({ expense: "0", income: "0", currency: "USD" });

  const classes = useStyles();

  const columns = [
    {
      field: 'id', headerName: 'ID', width: 90
    },
    {
      field: 'activity',
      headerName: 'Activity',
      width: 150,
    },
    {
      field: 'amount',
      headerName: 'Amount',
      width: 150,
    },
    {
      field: 'currency',
      headerName: 'Currency',
      width: 150,
    },
    {
      field: 'actions',
      headerName: 'Actions',
      renderCell: (props) => <ActionButtons {...props} setRefresh={setRefresh} handleClickEdit={handleClickEdit} />,
      sortable: false,
      width: 100,
      headerAlign: 'center',
      filterable: false,
      align: 'center',
      disableColumnMenu: true,
      disableReorder: true,
    },
  ];

  const currencies = [
    {
      value: 'USD',
      label: 'USD ($)',
    },
    {
      value: 'EUR',
      label: 'EUR (€)',
    },
    {
      value: 'TRY',
      label: 'TRY (₺)',
    },
  ];

  useEffect(() => {
    axios.get(`https://v6.exchangerate-api.com/v6/378fd22205e3d30066dc5543/latest/${total.currency}`)
      .then(res => {
        let sumExpenses = 0, sumIncomes = 0, rates = res.data?.conversion_rates;
        let rows = JSON.parse(localStorage.getItem("finance-tracker"));
        rows.forEach(el => {
          if (el.activity === "Expense") {
            sumExpenses += el.amount / rates[el.currency];
          } else {
            sumIncomes += el.amount / rates[el.currency];
          }
        });
        setTotal({ ...total, expense: sumExpenses, income: sumIncomes });
      })
  }, [total.currency, rows])


  // fetch all data
  useEffect(() => {
    let rows = localStorage.getItem("finance-tracker");
    if (rows) setRows(JSON.parse(rows));
  }, [refresh])


  // click create
  const handleClickCreate = (selectedId) => {
    setIsEditMode(false);
    setValues({ activity: 'Expense', amount: '', currency: 'EUR' });
    setOpenModal(true);
  }

  // click edit
  const handleClickEdit = (selectedId) => {
    const rowValue = rows.filter(el => el.id === selectedId)[0];
    setIsEditMode(true);
    setValues(rowValue);
    setOpenModal(true);
  }

  // add a activity
  const handleCreate = () => {
    const newRow = { id: rows[rows.length - 1]?.id + 1 || 1, ...values };
    const currentRows = JSON.parse(localStorage.getItem("finance-tracker")) || [];
    currentRows.push(newRow);
    localStorage.setItem("finance-tracker", JSON.stringify(currentRows));
    setRows([...rows, newRow]);
    setOpenModal(false);
  }

  // edit a activity
  const handleEdit = () => {
    let copyRows = [...rows];
    const edittedRows = copyRows.find(el => el.id === values.id);
    const index = copyRows.indexOf(edittedRows);
    copyRows[index] = values;
    localStorage.setItem("finance-tracker", JSON.stringify(copyRows));
    setRows(copyRows);
    setOpenModal(false);
  }

  // change input values
  const handleChange = (selector, event) => {
    setValues({ ...values, [selector]: event.target.value })
  }

  return (
    <Container maxWidth="md">
      <h1>Finance Tracker App </h1>
      <Box display="flex" justifyContent="flex-end" p={1} m={1}>
        <Button className={classes.button} variant="contained" color="primary"
          type="button" onClick={handleClickCreate}>
          Add
        </Button>
      </Box>

      <Box className="table">
        <DataGrid
          rows={rows}
          columns={columns}
          pageSize={5}
          rowsPerPageOptions={[5]}
          disableSelectionOnClick
        />
      </Box>

      <Box display="flex" justifyContent="flex-start" alignItems="center">
        <FormControl className={classes.formControl}>
          <InputLabel id="demo-simple-select-label">Currency</InputLabel>
          <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            value={total.currency}
            onChange={(e) => setTotal({ ...total, currency: e.target.value })}
          >
            <MenuItem value="USD">USD</MenuItem>
            <MenuItem value="EUR">EUR</MenuItem>
            <MenuItem value="TRY">TRY</MenuItem>
          </Select>
        </FormControl>
        <Box>
          <p>
            Total Expense: {total.expense}
          </p>
          <p>
            Total Income: {total.income}
          </p>
        </Box>
      </Box>

      {/* Modal */}
      <Modal
        open={openModal}
        onClose={() => setOpenModal(false)}
        className={classes.modal}>
        <Box className={classes.paper}>
          <h2>{isEditMode ? "Edit a Activity" : "Add a Activity"}</h2>
          <form className={classes.root} noValidate autoComplete="off">
            <FormControl component="fieldset" className={classes.formControl}>
              <FormLabel component="legend">Amount</FormLabel>
              <TextField type="number" value={values.amount} onChange={(e) => handleChange('amount', e)} />
            </FormControl>

            <FormControl component="fieldset" className={classes.formControl}>
              <FormLabel component="legend">Currency</FormLabel>
              <TextField select
                value={values.currency}
                onChange={(e) => handleChange('currency', e)}>
                {currencies.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </FormControl>

            <FormControl component="fieldset" className={classes.formControl}>
              <FormLabel component="legend">Activity Type</FormLabel>
              <RadioGroup row aria-label="gender" name="gender1" value={values.activity}
                onChange={(e) => handleChange('activity', e)}>
                <FormControlLabel value="Expense" control={<Radio />} label="Expense" />
                <FormControlLabel value="Income" control={<Radio />} label="Income" />
              </RadioGroup>
            </FormControl>

            <Box display="flex" justifyContent="flex-end">
              <Button className={classes.button} variant="contained" color="primary"
                type="button" onClick={isEditMode ? handleEdit : handleCreate}>
                Submit
              </Button>
            </Box>
          </form>
        </Box>
      </Modal>
    </Container >
  );
}

const useStyles = makeStyles((theme) => ({
  button: {
    border: 0,
    borderRadius: 3,
    boxShadow: '0 3px 5px 2px rgba(255, 105, 135, .3)',
    color: 'white',
    height: 48,
    padding: '0 30px',
  },
  modal: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paper: {
    backgroundColor: theme.palette.background.paper,
    border: '2px solid #000',
    boxShadow: theme.shadows[5],
    padding: theme.spacing(4),
  },
  formControl: {
    margin: theme.spacing(2),
    minWidth: 120,
  },
}));


