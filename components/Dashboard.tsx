import React, { useEffect } from 'react'
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { setOpenDashboard, setOpenNotificationDetail } from '../redux/features/isSlice';
import Currency from 'react-currency-formatter';
import { Order } from '../Models';
import { NextPage } from 'next';
import Divider from '@mui/material/Divider';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import dayjs from 'dayjs';
import currencyFormatter from 'currency-formatter'
import { setIdOrder } from '../redux/features/ordersSlice';
import { DataGrid, GridColDef, GridValueGetterParams } from '@mui/x-data-grid';
import Box from '@mui/material/Box';
import TablePagination from '@mui/material/TablePagination';
import TableSortLabel from '@mui/material/TableSortLabel';
import Toolbar from '@mui/material/Toolbar';
import Checkbox from '@mui/material/Checkbox';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import DeleteIcon from '@mui/icons-material/Delete';
import { alpha } from '@mui/material/styles';
import FilterListIcon from '@mui/icons-material/FilterList';
import { visuallyHidden } from '@mui/utils';


interface Props {
    setOpen: (a: boolean) => void
    isOpenDashboard: boolean
    orders: Order[]
}

interface Data {
    id: number;
    idOrder?: string | number
    type: string;
    orderer: string;
    owner: string;
    status: number;
    total: number;
    totalServiceFee: number;
    createdAt: string
}

interface HeadCell {
    disablePadding: boolean;
    id: keyof Data;
    label: string;
    numeric: boolean;
}

interface EnhancedTableProps {
    numSelected: number;
    onRequestSort: (event: React.MouseEvent<unknown>, property: keyof Data) => void;
    onSelectAllClick: (event: React.ChangeEvent<HTMLInputElement>) => void;
    order: OrderSort;
    orderBy: string;
    rowCount: number;
}



type OrderSort = 'asc' | 'desc';



const Dashboard: NextPage<Props> = ({ isOpenDashboard, setOpen, orders }) => {
    const { user }: any = useSelector<RootState>(state => state.user)
    const dispatch = useDispatch()
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
    const [order, setOrder] = React.useState<OrderSort>('asc');
    const [orderBy, setOrderBy] = React.useState<keyof Data>('total');
    const [selected, setSelected] = React.useState<readonly string[]>([]);
    const [page, setPage] = React.useState(0);
    const [dense, setDense] = React.useState(false);
    const [rowsPerPage, setRowsPerPage] = React.useState(5);

    const handleClose = () => {
        setOpen(false)
    }


    const handleOpenOrderDetail = (id: string) => {
        dispatch(setOpenNotificationDetail(true))
        dispatch(setIdOrder(id))
    }




    const rows: any[] = orders?.map((order: Order, index: number) => {
        return {
            id: index + 1,
            idOrder: order.id,
            type: order.type,
            orderer: order.ordererName,
            owner: order.ownerName,
            status: order.status,
            totalServiceFee: currencyFormatter.format((order.total / 100 * +process.env.NEXT_PUBLIC_SERVICE_FEE!), { code: 'VND' }),
            total: currencyFormatter.format(order.total, { code: 'VND' }),
            createdAt: dayjs(order.date).format("DD-MM-YYYY")
        }
    })

    function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
        if (b[orderBy] < a[orderBy]) {
            return -1;
        }
        if (b[orderBy] > a[orderBy]) {
            return 1;
        }
        return 0;
    }

    function getComparator<Key extends keyof any>(
        order: OrderSort,
        orderBy: Key,
    ): (
        a: { [key in Key]: number | string },
        b: { [key in Key]: number | string },
    ) => number {
        return order === 'desc'
            ? (a, b) => descendingComparator(a, b, orderBy)
            : (a, b) => -descendingComparator(a, b, orderBy);
    }



    function stableSort<T>(array: readonly T[], comparator: (a: T, b: T) => number) {
        const stabilizedThis = array.map((el, index) => [el, index] as [T, number]);
        stabilizedThis.sort((a, b) => {
            const order = comparator(a[0], b[0]);
            if (order !== 0) {
                return order;
            }
            return a[1] - b[1];
        });
        return stabilizedThis.map((el) => el[0]);
    }


    const headCells: readonly HeadCell[] = [
        {
            id: 'id',
            numeric: false,
            disablePadding: true,
            label: 'ID',
        },
        {
            id: 'type',
            numeric: false,
            disablePadding: false,
            label: 'Loại đơn hàng',
        },
        {
            id: 'orderer',
            numeric: false,
            disablePadding: false,
            label: 'Người đặt hàng',
        },
        {
            id: 'owner',
            numeric: false,
            disablePadding: false,
            label: 'Chủ sở hữu',
        },
        {
            id: 'total',
            numeric: true,
            disablePadding: false,
            label: 'Tổng tiền',
        },
        {
            id: 'totalServiceFee',
            numeric: true,
            disablePadding: false,
            label: 'Phí dịch vụ (10%)',
        },
        {
            id: 'status',
            numeric: false,
            disablePadding: false,
            label: 'Trạng thái',
        },
        {
            id: 'createdAt',
            numeric: false,
            disablePadding: false,
            label: 'Ngày đặt hàng',
        },
    ];




    function EnhancedTableHead(props: EnhancedTableProps) {
        const { onSelectAllClick, order, orderBy, numSelected, rowCount, onRequestSort } =
            props;
        const createSortHandler =
            (property: keyof Data) => (event: React.MouseEvent<unknown>) => {
                onRequestSort(event, property);
            };

        return (
            <TableHead>
                <TableRow>
                    <TableCell padding="checkbox">
                        <Checkbox
                            color="primary"
                            indeterminate={numSelected > 0 && numSelected < rowCount}
                            checked={rowCount > 0 && numSelected === rowCount}
                            onChange={onSelectAllClick}
                            inputProps={{
                                'aria-label': 'select all desserts',
                            }}
                        />
                    </TableCell>
                    {headCells.map((headCell) => (
                        <TableCell
                            key={headCell.id}
                            align={headCell.numeric ? 'right' : 'center'}
                            padding={headCell.disablePadding ? 'none' : 'normal'}
                            sortDirection={orderBy === headCell.id ? order : false}
                        >
                            <TableSortLabel
                                active={orderBy === headCell.id}
                                direction={orderBy === headCell.id ? order : 'asc'}
                                onClick={createSortHandler(headCell.id)}
                            >
                                {headCell.label}
                                {orderBy === headCell.id ? (
                                    <Box component="span" sx={visuallyHidden}>
                                        {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                                    </Box>
                                ) : null}
                            </TableSortLabel>
                        </TableCell>
                    ))}
                </TableRow>
            </TableHead>
        );
    }

    const handleRequestSort = (
        event: React.MouseEvent<unknown>,
        property: keyof Data,
    ) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.checked) {
            const newSelected = rows.map((n) => n.orderer);
            setSelected(newSelected);
            return;
        }
        setSelected([]);
    };

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };


    const isSelected = (name: string) => selected.indexOf(name) !== -1;

    // Avoid a layout jump when reaching the last page with empty rows.
    const emptyRows =
        page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0;

    return (
        <Dialog
            fullScreen={fullScreen}
            maxWidth={"xl"}
            open={isOpenDashboard}
            onClose={handleClose}
        >
            <DialogTitle textAlign={"center"}>Thống kê doanh thu</DialogTitle>
            <Divider />
            <DialogContent className="lg:w-[80vw] w-full h-full">
                <Box sx={{ width: '100%' }}>
                    <Paper sx={{ width: '100%', mb: 2 }}>
                        <TableContainer>
                            <Table
                                sx={{ minWidth: 750 }}
                                aria-labelledby="tableTitle"
                                size={dense ? 'small' : 'medium'}
                            >
                                <EnhancedTableHead
                                    numSelected={selected.length}
                                    order={order}
                                    orderBy={orderBy}
                                    onSelectAllClick={handleSelectAllClick}
                                    onRequestSort={handleRequestSort}
                                    rowCount={rows.length}
                                />
                                <TableBody>
                                    {/* if you don't need to support IE11, you can replace the `stableSort` call with:
              rows.sort(getComparator(order, orderBy)).slice() */}
                                    {stableSort(rows, getComparator(order, orderBy))
                                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                        .map((row, index) => {
                                            const isItemSelected = isSelected(`${row.id}`);
                                            const labelId = `enhanced-table-checkbox-${index}`;

                                            return (
                                                <TableRow
                                                    onClick={() => handleOpenOrderDetail(`${row.idOrder}`)}
                                                    hover
                                                    role="checkbox"
                                                    aria-checked={isItemSelected}
                                                    tabIndex={-1}
                                                    key={row.id}
                                                    selected={isItemSelected}
                                                >
                                                    <TableCell className="opacity-0" padding="checkbox">
                                                        <Checkbox
                                                            color="primary"
                                                            checked={isItemSelected}
                                                            inputProps={{
                                                                'aria-labelledby': labelId,
                                                            }}
                                                        />
                                                    </TableCell>
                                                    <TableCell
                                                        component="th"
                                                        id={labelId}
                                                        scope="row"
                                                        padding="none"
                                                    >
                                                        {row.id}
                                                    </TableCell>
                                                    <TableCell align="center">{row.type === "booking" ? "Sân bóng đá" : "Sản phẩm"}</TableCell>
                                                    <TableCell align="center">{row.orderer}</TableCell>
                                                    <TableCell align="center">{row.owner}</TableCell>
                                                    <TableCell align="right">{row.total}</TableCell>
                                                    <TableCell align="right">{row.totalServiceFee}</TableCell>
                                                    {row.status === 0 && row.type === "booking" &&
                                                        <TableCell className="text-blue-500" align="center">{"Đăng chờ xử lý"}</TableCell>
                                                    }
                                                    {row.status === 2 &&
                                                        <TableCell className="text-yellow-500" align="center">{"Chờ xác nhận"}</TableCell>
                                                    }
                                                    {row.status === 3 && row.type === "booking" &&
                                                        <TableCell className="text-primary" align="center">{"Xác nhận đặt sân thành công"}</TableCell>
                                                    }
                                                    {row.status === 3 && row.type === "order" &&
                                                        <TableCell className="text-primary" align="center">{"Xác nhận đơn hàng thành công"}</TableCell>
                                                    }
                                                    {row.status === 4 && row.type === "booking" &&
                                                        <TableCell className="text-red-500" align="center">{"Từ chối đặt sân"}</TableCell>
                                                    }
                                                    {row.status === 4 && row.type === "order" &&
                                                        <TableCell className="text-red-500" align="center">{"Từ chối đơn hàng"}</TableCell>
                                                    }
                                                    {row.status === 5 &&
                                                        <TableCell className="text-primary" align="center">{"Chờ lấy hàng"}</TableCell>
                                                    }
                                                    {row.status === 6 &&
                                                        <TableCell className="text-yellow-500" align="center">{"Đang giao"}</TableCell>
                                                    }
                                                    {row.status === 7 &&
                                                        <TableCell className="text-primary" align="center">{"Giao hàng thành công"}</TableCell>
                                                    }
                                                    {row.status === 8 &&
                                                        <TableCell className="text-red-500" align="center">{"Từ chối nhận hàng"}</TableCell>
                                                    }
                                                    {row.status === 9 &&
                                                        <TableCell className="text-primary" align="center">{"Đã hoàn tiền đặt hàng"}</TableCell>
                                                    }
                                                    {row.status === 10 && "Đơn hàng đã hết hạn"}
                                                    <TableCell align="center">{row.createdAt}</TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    {emptyRows > 0 && (
                                        <TableRow
                                            style={{
                                                height: (dense ? 33 : 53) * emptyRows,
                                            }}
                                        >
                                            <TableCell colSpan={6} />
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        <TablePagination
                            rowsPerPageOptions={[5, 10, 25]}
                            component="div"
                            count={rows.length}
                            rowsPerPage={rowsPerPage}
                            page={page}
                            onPageChange={handleChangePage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                        />
                    </Paper>
                </Box>
            </DialogContent>
            <Divider />
            <DialogActions>
                <DialogContentText className="flex py-3 justify-end space-x-2 px-3">
                    <Typography variant="body1" component="span"  >
                        {"Tổng doanh thu nhận được:"}
                    </Typography>
                    <Typography variant="body1" component="span" fontWeight={700}>
                        <Currency quantity={user.role === "owner" ? +orders.filter((order: Order) => order.status === 3 || order.status === 7).reduce(
                            (previousValue, currentValue) => previousValue + currentValue.total,
                            0
                        ) - +orders.filter((order: Order) => order.status === 3 || order.status === 7).reduce(
                            (previousValue, currentValue) => previousValue + currentValue.total,
                            0
                        ) / 100 * +process.env.NEXT_PUBLIC_SERVICE_FEE!
                            : +orders.filter((order: Order) => order.status === 3 || order.status === 7).reduce(
                                (previousValue, currentValue) => previousValue + currentValue.total,
                                0
                            ) / 100 * +process.env.NEXT_PUBLIC_SERVICE_FEE!} currency="VND" pattern="##,### !" />
                    </Typography>
                </DialogContentText>
            </DialogActions>
        </Dialog>
    )
}

export default Dashboard