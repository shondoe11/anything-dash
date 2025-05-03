import PropTypes from 'prop-types';
import { Card, Row, Col, Form, Table, Spinner, ToastContainer, Toast } from 'react-bootstrap';
import ReactPaginate from 'react-paginate';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAnglesLeft, faAnglesRight, faEllipsis, faCoins } from '@fortawesome/free-solid-svg-icons';

export default function AllCoins({
  vsCurrencies,
  pageCurrency,
  setPageCurrency,
  lastUpdated,
  searchQuery,
  setSearchQuery,
  coins,
  loading,
  error,
  page,
  setPage,
  pageToast,
  setPageToast,
  totalPages,
  formatLargeNumber,
}) {
  const handlePageChange = ({ selected }) => setPage(selected + 1);

  return (
    <Card className="my-4">
      <Card.Header>
        <Row className="align-items-center">
          <Col xs="auto">
            <div className="d-flex align-items-center">
              <FontAwesomeIcon icon={faCoins} className="me-2" />
              <small className="mb-0">All Coins</small>
            </div>
          </Col>
          <Col className="d-flex justify-content-center">
            <Form.Select
              size="sm"
              className="w-auto"
              style={{ width: '4rem' }}
              value={pageCurrency}
              onChange={(e) => {
                const val = e.target.value;
                setPageCurrency(val);
                setPage(1);
                setPageToast({ show: true, message: `Switched to ${val.toUpperCase()} successfully`, variant: 'success' });
              }}
            >
              {vsCurrencies.map((v) => (
                <option key={v} value={v}>
                  {v.toUpperCase()}
                </option>
              ))}
            </Form.Select>
          </Col>
          <Col xs="auto" className="text-end">
            <small className="text-muted">Last Updated: {lastUpdated ? lastUpdated.toLocaleString() : '-'}</small>
          </Col>
        </Row>
      </Card.Header>
      <Card.Body>
        <div className="d-flex align-items-center mb-3">
          <Form.Control
            type="text"
            placeholder="Search coins..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            style={{ maxWidth: '200px' }}
            className="me-3"
          />
        </div>
        {loading && (
          <div className="text-center py-5">
            <Spinner animation="border" />
          </div>
        )}
        {error && <p className="text-danger">Failed to load coins.</p>}
        {!loading && !error && (
          <>
            <Table hover bordered responsive className="rounded mb-3 crypto-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Name</th>
                  <th>Symbol</th>
                  <th>Price ({pageCurrency.toUpperCase()})</th>
                  <th>Market Cap</th>
                  <th>24h Change</th>
                  <th>24h Volume</th>
                  <th>Circulating Supply</th>
                  <th>Total Supply</th>
                  <th>Max Supply</th>
                  <th>High (24h)</th>
                  <th>Low (24h)</th>
                  <th>Last Updated</th>
                </tr>
              </thead>
              <tbody>
                {coins.map((coin) => {
                  let fmt;
                  try {
                    fmt = new Intl.NumberFormat('en', { style: 'currency', currency: pageCurrency.toUpperCase() });
                  } catch {
                    fmt = new Intl.NumberFormat('en', { style: 'currency', currency: 'USD' });
                  }
                  const price = fmt.format(coin.current_price);
                  const mcap = formatLargeNumber(coin.market_cap);
                  const vol = formatLargeNumber(coin.total_volume);
                  const circ = formatLargeNumber(coin.circulating_supply);
                  const totalSupply = formatLargeNumber(coin.total_supply);
                  const maxSupply = formatLargeNumber(coin.max_supply);
                  const change = coin.price_change_percentage_24h?.toFixed(2) || '0.00';
                  return (
                    <tr key={coin.id}>
                      <td>{coin.market_cap_rank}</td>
                      <td>{coin.name}</td>
                      <td>{coin.symbol.toUpperCase()}</td>
                      <td>{price}</td>
                      <td>{mcap}</td>
                      <td className={coin.price_change_percentage_24h >= 0 ? 'text-success' : 'text-danger'}>
                        {change}%
                      </td>
                      <td>{vol}</td>
                      <td>{circ}</td>
                      <td>{totalSupply}</td>
                      <td>{maxSupply}</td>
                      <td>{fmt.format(coin.high_24h)}</td>
                      <td>{fmt.format(coin.low_24h)}</td>
                      <td>{lastUpdated ? lastUpdated.toLocaleString() : '-'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
            <ReactPaginate
              pageCount={totalPages}
              forcePage={page - 1}
              onPageChange={handlePageChange}
              pageRangeDisplayed={2}
              marginPagesDisplayed={1}
              previousLabel={<FontAwesomeIcon icon={faAnglesLeft} />}
              nextLabel={<FontAwesomeIcon icon={faAnglesRight} />}
              breakLabel={<FontAwesomeIcon icon={faEllipsis} />}
              containerClassName="pagination justify-content-center mt-3"
              pageClassName="page-item"
              pageLinkClassName="page-link"
              previousClassName="page-item"
              previousLinkClassName="page-link"
              nextClassName="page-item"
              nextLinkClassName="page-link"
              breakClassName="page-item"
              breakLinkClassName="page-link"
              activeClassName="active"
              disabledClassName="disabled"
            />
          </>
        )}
        <ToastContainer position="top-end" className="p-3">
          <Toast onClose={() => setPageToast((prev) => ({ ...prev, show: false }))} show={pageToast.show} bg={pageToast.variant} delay={3000} autohide>
            <Toast.Body>{pageToast.message}</Toast.Body>
          </Toast>
        </ToastContainer>
      </Card.Body>
    </Card>
  );
}

AllCoins.propTypes = {
  vsCurrencies: PropTypes.arrayOf(PropTypes.string).isRequired,
  pageCurrency: PropTypes.string.isRequired,
  setPageCurrency: PropTypes.func.isRequired,
  lastUpdated: PropTypes.instanceOf(Date),
  searchQuery: PropTypes.string.isRequired,
  setSearchQuery: PropTypes.func.isRequired,
  coins: PropTypes.array.isRequired,
  loading: PropTypes.bool.isRequired,
  error: PropTypes.any,
  page: PropTypes.number.isRequired,
  setPage: PropTypes.func.isRequired,
  pageToast: PropTypes.shape({ show: PropTypes.bool, message: PropTypes.string, variant: PropTypes.string }).isRequired,
  setPageToast: PropTypes.func.isRequired,
  totalPages: PropTypes.number.isRequired,
  formatLargeNumber: PropTypes.func.isRequired,
};
