import { useEffect, useState } from "react"
import { useDispatch } from "react-redux";
import { useModal } from "../../context/Modal";
import * as sessionActions from "../../store/session";

export default function SignupFormModal() {
    const dispatch = useDispatch();
    const [username, setUsername] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('')
    const [errors, setErrors] = useState({});
    const { closeModal } = useModal();

    useEffect(() => {
        const errs = {};
        if (!email) errs.email = '';
        if (!username) errs.username = '';
        if (!firstName) errs.firstName = '';
        if (!lastName) errs.lastName = '';
        if (!password) errs.password = '';
        if (!confirmPassword) errs.confirmPassword = '';
        if (username && username.length < 4) errs.username = 'Username must be 4 characters at minimum';
        if (password && password.length < 6) errs.password = 'Password must be 6 characters at minimum';
        if (confirmPassword && password !== confirmPassword) errs.confirmPassword = 'Password and confirm password must match';

        setErrors(errs);
    }, [email, username, firstName, lastName, password, confirmPassword])

    const handleSubmit = (e) => {
        e.preventDefault();

        if (password === confirmPassword) {
            setErrors({});

            return dispatch(
                sessionActions.signup({
                    email,
                    username,
                    firstName,
                    lastName,
                    password
                })
            )
                .then(closeModal)
                .catch(async (res) => {
                    const data = await res.json();

                    if (data?.errors) {
                        setErrors(data.errors);
                    }
                });
        }
        return setErrors({
            confirmPassword: "Confirm Password field must be the same as the Password field"
        });
    };

    return (
        <section className="modal">

            <h1>Sign Up</h1>
            <form onSubmit={handleSubmit}>
                <div className="inputContainer">
                    <input
                        type="text"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder=""
                        id="email"
                    />
                    <label htmlFor="email" className="floating-label">Email*</label>
                    <div className="error">{errors.email &&
                        <><i className="fa-solid fa-circle-exclamation" /> {errors.email}</>}</div>
                </div>
                <div className="inputContainer">
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder=""
                        id="username"
                    />
                    <label htmlFor="username" className="floating-label">Username*</label>
                </div>
                <div className="error">{errors.username &&
                    <><i className="fa-solid fa-circle-exclamation" /> {errors.username}</>}</div>
                <div className="inputContainer">
                    <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder=""
                        id="firstname"
                    />
                    <label htmlFor="firstname" className="floating-label">First Name*</label>
                    <div className="error">{errors.firstName &&
                        <><i className="fa-solid fa-circle-exclamation" /> {errors.firstName}</>}</div>
                </div>
                <div className="inputContainer">
                    <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder=""
                        id="lastname"
                    />
                    <label htmlFor="lastname" className="floating-label">Last Name*</label>
                    <div className="error">{errors.lastName &&
                        <><i className="fa-solid fa-circle-exclamation" /> {errors.lastName}</>}</div>
                </div>
                <div className="inputContainer">
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder=""
                        id="password"
                    />
                    <label htmlFor="password" className="floating-label">Password*</label>
                    <div className="error">{errors.password &&
                        <><i className="fa-solid fa-circle-exclamation" /> {errors.password}</>}</div>
                </div>
                <div className="inputContainer">
                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder=""
                        id="confirmpassword"
                    />
                    <label htmlFor="confirmpassword" className="floating-label">Confirm Password*</label>
                    <div className="error">{errors.confirmPassword &&
                        <><i className="fa-solid fa-circle-exclamation" /> {errors.confirmPassword}</>}</div>
                </div>
                <div>
                    <button style={{ marginTop: "15px" }}
                        disabled={Object.values(errors).length}
                        type="submit">Sign Up</button>
                </div>
            </form>
        </section>
    )
}
