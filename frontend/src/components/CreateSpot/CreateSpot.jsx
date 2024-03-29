import SpotForm from "../SpotForm";

export default function CreateSpot() {
    const spot = {
        country: '',
        address: '',
        city: '',
        state: '',
        lat: '',
        lng: '',
        description: '',
        name: '',
        price: '',
        url: '',
        img2: '',
        img3: '',
        img4: '',
        img5: '',
    }

    return (
        <SpotForm
            spot={spot}
            formType="Create a New Spot"
        />
    )
}

// import { useState, useEffect } from 'react';
// import { useDispatch } from 'react-redux';
// import { useNavigate } from 'react-router-dom';
// import { createSpot, createSpotImage } from '../../store/spots';
// import './CreateSpot.css';

// export default function CreateSpot() {
//     const dispatch = useDispatch();
//     const navigate = useNavigate();
//     const [country, setCountry] = useState('');
//     const [address, setAddress] = useState('');
//     const [city, setCity] = useState('');
//     const [state, setState] = useState('');
//     const [lat, setLat] = useState('');
//     const [lng, setLng] = useState('');
//     const [description, setDescription] = useState('');
//     const [name, setName] = useState('');
//     const [price, setPrice] = useState('');
//     const [url, setUrl] = useState('');
//     const [img2, setImg2] = useState('');
//     const [img3, setImg3] = useState('');
//     const [img4, setImg4] = useState('');
//     const [img5, setImg5] = useState('');
//     const [validateErrors, setValidateErrors] = useState({});
//     const [errors, setErrors] = useState({});

//     const updateCountry = (e) => setCountry(e.target.value);
//     const updateAddress = (e) => setAddress(e.target.value);
//     const updateCity = (e) => setCity(e.target.value);
//     const updateState = (e) => setState(e.target.value);
//     const updateLat = (e) => setLat(e.target.value);
//     const updateLng = (e) => setLng(e.target.value);
//     const updateDescription = (e) => setDescription(e.target.value);
//     const updateName = (e) => setName(e.target.value);
//     const updatePrice = (e) => setPrice(e.target.value);
//     const updateUrl = (e) => setUrl(e.target.value);
//     const updateImg2 = (e) => setImg2(e.target.value);
//     const updateImg3 = (e) => setImg3(e.target.value);
//     const updateImg4 = (e) => setImg4(e.target.value);
//     const updateImg5 = (e) => setImg5(e.target.value);

//     useEffect(() => {
//         const errs = {};

//         if (!country) errs.country = 'Country is required';
//         if (!address) errs.address = 'Address is required';
//         if (!city) errs.city = 'City is required';
//         if (!state) errs.state = 'State is required';
//         if (!lat) errs.lat = 'Latitude is required';
//         if (!lng) errs.lng = 'Longitude is required';
//         if (!description) errs.description = 'Description is required';
//         if (!name) errs.name = 'Name is required';
//         if (!price) errs.price = 'Price is required';
//         if (!url) errs.url = 'Preview image is required';
//         if (lat && (lat > 90 || lat < -90)) errs.lat = 'Latitude is not valid';
//         if (lng && (lng > 180 || lng < -180)) errs.lng = 'Longitude is not valid';
//         if (description && description.length < 30) errs.description = 'Description must be 30 characters at minimum';
//         if (price < 0) errs.price = 'Price per night must be greater than $0';

//         const urlFormat = url.split('.').pop();
//         const img2Format = img2.split('.').pop();
//         const img3Format = img3.split('.').pop();
//         const img4Format = img4.split('.').pop();
//         const img5Format = img5.split('.').pop();

//         if (url && (urlFormat !== 'jpg' && urlFormat !== 'jpeg' && urlFormat !== 'png')) errs.url = 'Image URL must end in .png, .jpg, or .jpeg';
//         if (img2 && (img2Format !== 'jpg' && img2Format !== 'jpeg' && img2Format !== 'png')) errs.img2 = 'Image URL must end in .png, .jpg, or .jpeg';
//         if (img3 && (img3Format !== 'jpg' && img3Format !== 'jpeg' && img3Format !== 'png')) errs.img3 = 'Image URL must end in .png, .jpg, or .jpeg';
//         if (img4 && (img4Format !== 'jpg' && img4Format !== 'jpeg' && img4Format !== 'png')) errs.img4 = 'Image URL must end in .png, .jpg, or .jpeg';
//         if (img5 && (img5Format !== 'jpg' && img5Format !== 'jpeg' && img5Format !== 'png')) errs.img5 = 'Image URL must end in .png, .jpg, or .jpeg';

//         setErrors(errs)
//     }, [country, address, city, state, lat, lng, description, name, price, url, img2, img3, img4, img5])

//     const reset = () => {
//         setCountry('');
//         setAddress('');
//         setCity('');
//         setState('')
//         setLat('');
//         setLng('');
//         setDescription('');
//         setName('');
//         setPrice('');
//         setUrl('');
//         setImg2('');
//         setImg3('');
//         setImg4('');
//         setImg5('');
//     }

//     const handleSubmit = (e) => {
//         e.preventDefault();
//         setErrors({});

//         const spotInfo = {
//             country,
//             address,
//             city,
//             state,
//             lat,
//             lng,
//             description,
//             name,
//             price
//         };

//         const imageInfo = ({
//             url,
//             img2,
//             img3,
//             img4,
//             img5
//         })

//         const images = Object.values(imageInfo).filter(img => img !== '');

//         dispatch(createSpot(spotInfo))
//             .then((spot) => {
//                 let spotImage;
//                 images.forEach((image, index) => {
//                     if (index === 0) {
//                         spotImage = {
//                             id: spot.id,
//                             url: image,
//                             preview: true
//                         }
//                     } else {
//                         spotImage = {
//                             id: spot.id,
//                             url: image,
//                             preview: false
//                         }
//                     }
//                     dispatch(createSpotImage(spot.id, spotImage))
//                         .then(navigate(`/spots/${spot.id}`))
//                 })

//             })
//             // .then(reset())
//             .catch(async (res) => {
//                 const data = await res.json()
//                 if (data && data.errors) {
//                     setErrors(data.errors)
//                 }
//             })
//     }
//     console.log("X", !!Object.values(errors).length);

//     return (
//         <section className='createSpotForm'>
//             <form onSubmit={handleSubmit}>
//                 <h1>Create a New Spot</h1>
//                 <h2>Where&apos;s your place located?</h2>
//                 <div>Guests will only get your exact address once they book a reservation.</div>
//                 <input
//                     type='text'
//                     placeholder='Country*'

//                     value={country}
//                     onChange={updateCountry}
//                 />
//                 <div className='error'>{errors.country && `${errors.country}`}</div>
//                 <input
//                     type='text'
//                     placeholder='Street Address*'
//                     // required
//                     value={address}
//                     onChange={updateAddress}
//                 />
//                 <div className='error'>{errors.address && `${errors.address}`}</div>
//                 <div className='cityState'>
//                     <div id='city'>
//                         <input
//                             type='text'
//                             placeholder='City*'
//                             // required
//                             value={city}
//                             onChange={updateCity}
//                         />
//                         &nbsp;,&nbsp;
//                     </div>
//                     <div className='error'>{errors.city && `${errors.city}`}</div>
//                     <div id='state'>
//                         <input
//                             type='text'
//                             placeholder='State*'
//                             // required
//                             value={state}
//                             onChange={updateState}
//                         />
//                     </div>
//                     <div className='error'>{errors.state && `${errors.state}`}</div>
//                 </div>
//                 <div className='latLng'>
//                     <div id='lat'>
//                         <input
//                             type='text'
//                             placeholder='Latitude*'
//                             // required
//                             value={lat}
//                             onChange={updateLat}
//                         />
//                         &nbsp;,&nbsp;
//                     </div>
//                     <div className='error'>{errors.lat && `${errors.lat}`}</div>
//                     <div id='lng'>
//                         <input

//                             type='text'
//                             placeholder='Longitude*'
//                             // required
//                             value={lng}
//                             onChange={updateLng}
//                         />
//                     </div>
//                     <div className='error'>{errors.lng && `${errors.lng}`}</div>
//                 </div>
//                 <hr />
//                 <h2>Describe your place to guests</h2>
//                 <div>Mention the best features of your space, any special amentities, like fast WiFi or parking, and what you love about the neighborhood.</div>
//                 <textarea
//                     type='text'
//                     placeholder='Description (minimum 30 characters)*'
//                     // required
//                     value={description}
//                     onChange={updateDescription}
//                 />
//                 <div className='error'>{errors.description && `${errors.description}`}</div>
//                 <hr />
//                 <h2>Create a title for your spot</h2>
//                 <div>Catch guests&apos; attention with a spot title that highlights what makes your place special.</div>
//                 <input
//                     type='text'
//                     placeholder='Name of your spot*'
//                     // required
//                     value={name}
//                     onChange={updateName}
//                 />
//                 <div className='error'>{errors.name && `${errors.name}`}</div>
//                 <hr />
//                 <h2>Set a base price for your spot</h2>
//                 <div>Competitive pricing can help your listing stand out and rank higher in search results.</div>
//                 <div className='price'>$&nbsp;
//                     <input
//                         type='number'
//                         placeholder='Price per night (USD)*'
//                         // required
//                         value={price}
//                         onChange={updatePrice}
//                     />
//                 </div>
//                 <div className='error'>{errors.price && `${errors.price}`}</div>
//                 <hr />
//                 <h2>Liven up your spot with photos</h2>
//                 <div>Submit a link to at least one photo to publish your spot.</div>
//                 <input
//                     type='text'
//                     placeholder='Preview Image URL*'
//                     // required
//                     value={url}
//                     onChange={updateUrl}
//                 />
//                 <div className='error'>{errors.url && `${errors.url}`}</div>
//                 <input
//                     type='text'
//                     placeholder='Image URL'
//                     value={img2}
//                     onChange={updateImg2}
//                 />
//                 <div className='error'>{errors.img2 && `${errors.img2}`}</div>
//                 <input
//                     type='text'
//                     placeholder='Image URL'
//                     value={img3}
//                     onChange={updateImg3}
//                 />
//                 <div className='error'>{errors.img3 && `${errors.img3}`}</div>
//                 <input
//                     type='text'
//                     placeholder='Image URL'
//                     value={img4}
//                     onChange={updateImg4}
//                 />
//                 <div className='error'>{errors.img4 && `${errors.img4}`}</div>
//                 <input
//                     type='text'
//                     placeholder='Image URL'
//                     value={img5}
//                     onChange={updateImg5}
//                 />
//                 <div className='error'>{errors.img5 && `${errors.img5}`}</div>
//                 <hr />
//                 <div id='submit'>
//                     <button
//                         type='submit'
//                         disabled={!!Object.values(errors).length}>Create Spot</button>
//                 </div>

//             </form>
//         </section >
//     )
// }
