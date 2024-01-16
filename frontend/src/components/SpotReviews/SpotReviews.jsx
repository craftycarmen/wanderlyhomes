import { useParams } from 'react-router-dom';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSpotReviews } from '../../store/reviews';

export default function SpotReviews() {
    const { spotId } = useParams();
    const dispatch = useDispatch();
    const reviews = Object.values(useSelector(state => state.reviews))

    useEffect(() => {
        dispatch(fetchSpotReviews(spotId));
    }, [dispatch, spotId])

    const reviewDate = (date) => {
        const newDate = new Date(date)
        return newDate.toLocaleString('default', { month: 'long', year: 'numeric' })
    }

    return (reviews &&
        <>
            <hr />
            <div>SpotReviews</div>
            {reviews.map((review) => (
                <div key={review.id}>
                    <div style={{ fontWeight: 'bold' }}>{review.User?.firstName}</div>
                    <div style={{ color: 'gray' }}>{review.createdAt &&
                        reviewDate(review.createdAt)
                    }
                    </div>
                    <div>{review.review}</div>
                    <br />
                </div>
            ))
            }
        </>

    )
}