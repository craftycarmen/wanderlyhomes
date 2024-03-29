import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSpotReviews } from '../../store/reviews';
import CreateReviewButton from '../CreateReviewModal/CreateReviewButton';
import DeleteReviewModalButton from '../DeleteReviewModal/DeleteReviewModalButton';
import { fetchSpotDetails } from '../../store/spots';

export default function SpotReviews({ spotId, sessionUser, spot }) {
    const dispatch = useDispatch();
    const reviews = Object.values(useSelector(state => state.reviews)).sort((a, b) => {
        if (a.createdAt > b.createdAt) return -1;
        if (a.createdAt < b.createdAt) return 1;
        return 0;
    });

    const userId = sessionUser?.id;

    const userReviewed = reviews.filter(review => {
        if (review.userId === userId) return true;
    })

    // useEffect(() => {

    //     dispatch(fetchSpotDetails(spotId))
    //         .then(async () => await dispatch(fetchSpotReviews(spotId)))

    //     // return () => {
    //     //     dispatch(clearReviews());
    //     // }
    // }, [dispatch, spotId])

    useEffect(() => {

        dispatch(fetchSpotReviews(spotId))
            .then(async () => {
                if (reviews.length) {
                    await dispatch(fetchSpotDetails(spotId))
                }
            })

        // return () => {
        //     dispatch(clearReviews());
        // }
    }, [dispatch, spotId, reviews.length])

    const reviewDate = (date) => {
        const newDate = new Date(date)
        return newDate.toLocaleString('default', { month: 'long', year: 'numeric' })
    }

    return (reviews &&
        <section>
            {sessionUser && userReviewed.length === 0 && spot.ownerId !== userId &&
                <div style={{ marginBottom: "15px" }}>
                    <CreateReviewButton spotId={spotId} />
                </div>
            }

            {reviews.map((review) => (
                <div key={review.id} className='reviews'>
                    <div style={{ fontWeight: '600' }}>{sessionUser?.id === review.User?.id ? sessionUser.firstName : (review.User?.firstName)}</div>
                    <p style={{ color: 'gray', marginTop: "0px" }}>{review.createdAt &&
                        reviewDate(review.createdAt)
                    }
                    </p>
                    <div style={{ marginTop: "-15px" }}>{review.review}</div>
                    {review.userId === userId &&
                        <div style={{ marginTop: "10px", marginBottom: "15px" }}>
                            <DeleteReviewModalButton reviewId={review.id} spotId={spotId} />
                        </div>
                    }
                    <br />
                </div>
            ))
            }
        </section>

    )
}
