import ReactStars from 'react-rating-stars-component';
import PropTypes from 'prop-types';

export default function StarRating({ value, onChange }) {
  return (
    <ReactStars
      count={5}
      value={value}
      onChange={onChange}
      size={24}
      half
      activeColor="#ffd700"
      emptyIcon={<i className="far fa-star" />}
      halfIcon={<i className="fa fa-star-half-alt" />}
      filledIcon={<i className="fa fa-star" />}
      a11y
      isHalf
      tooltips={['poor','fair','good','very good','excellent']}
    />
  );
}

StarRating.propTypes = {
  value: PropTypes.number,
  onChange: PropTypes.func.isRequired,
};
