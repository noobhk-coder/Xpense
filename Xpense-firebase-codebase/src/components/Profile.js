//basic imports
import React, { useEffect, useContext, useState } from 'react';
//cloud storage imports
import firebase from "firebase/app";
import "firebase/storage";
//other components import
import SignOutButton from './SignOut';
import ChangePassword from './ChangePassword';
//databse functions import
import { AuthContext } from "../firebase/Auth";
import { getUser, updateProfilePicturePost,getCollege, updateAccountDetailsPost, getUserPosts, addCommentToPost, updateProfilePic, updateAccountInfo, getAllColleges } from '../firebase/FirestoreFunctions';
//css import
import '../App.css';
import Button from 'react-bootstrap/Button';
import Carousel from 'react-bootstrap/Carousel';
//datepicker imports
import 'date-fns';
import Grid from '@material-ui/core/Grid';
import DateFnsUtils from '@date-io/date-fns';
import {
	MuiPickersUtilsProvider,
	KeyboardDatePicker
} from '@material-ui/pickers';
//import for toggle button
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
//import for dropdown material ui
import FormControl from '@material-ui/core/FormControl';
import { FormLabel } from 'react-bootstrap';
//static file init
const defpic = require('../assets/default-avatar.png')


function Profile() {
	//user states
	const { currentUser } = useContext(AuthContext);
	const [user, setUser] = useState();
	//loading state
	const [loading, setLoading] = useState(true);
	const [temp, setTemp] = useState(false);
	//database states
	const [change, setChange] = useState(false);
	const [profPic, setProfPic] = useState();
	const [profPicUrl, setProfPicUrl] = useState();
	const [formSubmit, setFormSubmit] = useState(false);
	const [dob, setDob] = useState();
	const [currentStudent, setCurrentStudent] = useState(false);
	//college states
	const [collegeList, setCollegeList] = useState();
	const [collegeSelected, setCollegeSelected] = useState();
	//user posts state
	const [userPosts, setUserPosts] = useState();
	const [postId, setPostId] = useState();
	//state for profile pic upload btn
	const [showUploadButton, setShowUploadButton] = useState(false);
	//state for college name
	const [userCollegeName,setUserCollegeName] =useState();

	
	//lifecycle method
	useEffect(() => {
		async function getData() {
			try {
				//fetch user details from db
				let u = await getUser(currentUser.uid);
				setLoading(false)
				setUser(u);
				setCurrentStudent(u.currentStudent)
				setDob(u.dob);
				//fetch college name of user 
				if(u.collegeId) {
				let cname = await getCollege(u.collegeId);
				setUserCollegeName(cname.name);
				}
				// fetch college list from db
				let allColleges = await getAllColleges();
				setCollegeList(allColleges);
				//fetch user posts from db
				let allPostsOfUser = await getUserPosts(currentUser.uid);
				//sort user posts
				if (allPostsOfUser) {
					const sortedUserPosts = allPostsOfUser.sort((a, b) => b.createdAt - a.createdAt)
					setUserPosts(sortedUserPosts);
				}
			} catch (e) {
				console.log(e)
			}
		}
		getData();
	}, [currentUser, formSubmit]);

	//onChange handler for input field of profile picture
	const handleChange = async (event) => {
		event.preventDefault();
		if (event.target.files[0]) {
			const profilePicture = event.target.files[0];
			setProfPic(profilePicture);
			setShowUploadButton(!showUploadButton);
		}
	}

	//submit function for profile picture form
	const handleUpload = async (event) => {
		event.preventDefault();
		var metadata = {
			contentType: 'image/jpeg'
		};
		const { profilepicfile } = event.target.elements;
		const storage = firebase.storage();
		const imageName = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15) + profPic.name;

		const uploadTask = storage.ref(`/profilePics/${imageName}`).put(profPic);

		// Listen for state changes, errors, and completion of the upload.
		uploadTask.on('state_changed',
			(snapShot) => {
				//takes a snap shot of the process as it is happening
				console.log(snapShot)
			}, (err) => {
				//catches the errors
				console.log(err)
			}, () => {
				// gets the functions from storage refences the image storage in firebase by the children
				// gets the download url then sets the image from firebase as the value for the imgUrl key:
				storage.ref('profilePics').child(imageName).getDownloadURL()
					.then(fireBaseUrl => {
						//setProfPicUrl(prevObject => ({...prevObject, imgUrl: fireBaseUrl}))
						setProfPicUrl(fireBaseUrl);
						try {
							updateProfilePic(currentUser.uid, fireBaseUrl);
							updateProfilePicturePost(currentUser.uid, fireBaseUrl);
							setShowUploadButton(!showUploadButton);
							setFormSubmit(!formSubmit);

						} catch (error) {
							alert(error);
						}
						profilepicfile.value = "";
					})
			})
	}

	//change handler for form input
	const handleDateChange = async (date) => {
		//event.preventDefault();
		setDob(date);

	}
	//change handler for toggle button
	const handleToggleChange = async (event) => {
		setCurrentStudent(!currentStudent);
	}

	//submit form for comments
	const handleCommentSubmit = async (event) => {
		event.preventDefault();
		const { comment } = event.target.elements;
		try {
			//add comment to the post db
			await addCommentToPost(postId, user.firstName + " " + user.lastName, comment.value)
			setFormSubmit(!formSubmit);
		} catch (error) {
			alert(error);
		}
		comment.value = ""
	}

	//function to update account details of the user
	const handleAccountUpdate = async (event) => {
		event.preventDefault();
		let { firstName, lastName, dob, collegeSelect } = event.target.elements;
		const first = firstName.value;
		const last = lastName.value;
		const dateOfBirth = dob.value;
		let selectedCollegeId;
		if (!currentStudent) {
			selectedCollegeId = '';
		} else {
			selectedCollegeId = collegeSelect.value
		}
		let status = currentStudent;
		try {
			await updateAccountInfo(currentUser.uid, first, last, dateOfBirth, selectedCollegeId, status);
			await updateAccountDetailsPost(currentUser.uid, first, last);
			setFormSubmit(!formSubmit);

		} catch (error) {
			alert(error);
		}
		setTemp(!temp);

	};

	//component code
	if (!loading) {
		return (
			<div className="container container1">
				{/* Profile picture part */}
				<div class="row">

					{/* form to update account details */}



					{temp ? (


						<div className="col-lg-4 col-md-12 col-sm-12">
							<br></br>
							<div className="post">

								<div className="text-center">

									{user && user.photoURL ? (<img className="align-self-center" c src={user.photoURL} alt='profilePic' class="avatarPic avatarPic2" />) : (<p>Default Picture<br /><img src={defpic} alt='defaultpic' class="avatarPic avatarPic2" /></p>)}

									{/* display user details from db */}
									{user ? (<p class="profileName">{user.firstName} {user.lastName}</p>) : (<p>NOT GETTING USER DATA</p>)}


									{/* form to chang profile pic */}

									<form onSubmit={handleUpload}>
										<label for="profilepicfile" class="pp">Change Profile Picture</label>

										<input type='file' accept="image/*" className='comment2 upload' name="profilepicfile" id="profilepicfile" onChange={handleChange} />
										<br></br>
										{showUploadButton ? (
											<Button  className="loginButt loginButt2 profileButt"> Accept<i class="fas fa-check-circle"></i></Button>
											) : (
												<p></p>
											)}
											<br></br><br></br>
									</form>


								</div>
							</div>

							<div class="post">
								<h2>Edit account info</h2>
								{/* account form starts here */}
								<form id="accountInfoForm" name="accountInfoForm" onSubmit={handleAccountUpdate}>
									<label for="firstName">First Name</label>
									<input required type="text" id="firstName" class="form-control" defaultValue={user.firstName} name="firstName" placeholder="Enter your first name" />
									<br></br>
									<label for="lastName">Last Name</label>
									<input required type="text" defaultValue={user.lastName} class="form-control" id="lastName" name="lastName" placeholder="Enter your last name" />
									<br>
									</br>
									{/* material ui date picker for dob */}
									<label>Date of birth</label>
									<MuiPickersUtilsProvider utils={DateFnsUtils}>
										<Grid container justify="left">
											<KeyboardDatePicker
												margin="0"
												id="dob"
												name="dob"
												format="MM/dd/yyyy"
												value={dob}
												required
												onChange={handleDateChange}
												KeyboardButtonProps={{
													'aria-label': 'change date',
												}}
											/>
										</Grid>
									</MuiPickersUtilsProvider>
									<br></br>
									{/*input field for college name if user is a current student */}
									{user.currentStudent ? (
											<p><b>{userCollegeName}</b></p>
									) : (
										<div>
										{currentStudent ? (
											<div>
												<FormControl component="fieldset">
													<FormLabel component="legend">Are you a current student</FormLabel>
	
													<FormGroup row>
														<FormControlLabel
															control={<Switch checked={currentStudent} onChange={handleToggleChange} name="yes" />}
															label="Yes" labelPlacement="end"
														/>
													</FormGroup>
												</FormControl>
												<br></br>
												<select
													className='text-center '
													name='collegeSelect'
													id='collegeSelect'>
													{collegeList && collegeList.map((item) => {
														return (
															<option selected={item.id == user.collegeId ? (true) : (false)} value={item.id}>{item.name}</option>
	
														)
													})}
	
												</select>
											</div>
										) : (
												<FormControl component="fieldset">
													<FormLabel component="legend">Are you a current student</FormLabel>
	
													<FormGroup row>
														<FormControlLabel
															control={<Switch checked={currentStudent} onChange={handleToggleChange} name="yes" />}
															label="Yes" labelPlacement="end"
														/>
													</FormGroup>
												</FormControl>)}
												</div>
									)}
									
									<br></br>
									<br></br>
									<div class="row">
										<div class="col-lg-6 col-md-6 col-sm-6 col-xs-6">
											<Button type='submit' className="loginButt loginButt2">Apply Changes</Button>
										</div>
										<div class="col-lg-6 col-md-6 col-sm-6 col-xs-6">
											<Button variant="primary" onClick={() => setTemp(!temp)} type='submit' className="loginButt"> Cancel Changes</Button>
										</div>
									</div>

								</form>
								{/* form to change account details ends */}
								<br></br>



							</div>



						</div>

					) : (

							<div className="col-lg-4 col-md-12 col-sm-12">
								<br></br>
								<div className="post">

									<div className="text-center">

										{user && user.photoURL ? (<img className="align-self-center" c src={user.photoURL} alt='profilePic' class="avatarPic avatarPic2" />) : (<p>Default Picture<br /><img src={defpic} alt='defaultpic' class="avatarPic avatarPic2" /></p>)}

										{/* display user details from db */}
										{user ? (<p class="profileName">{user.firstName} {user.lastName}</p>) : (<p>NOT GETTING USER DATA</p>)}
										{/* form to chang profile pic */}

										<form onSubmit={handleUpload}>
											<label for="profilepicfile" class="pp">Change Profile Picture</label>
											<input type='file' accept="image/*" className='comment2 upload' name="profilepicfile" id="profilepicfile" onChange={handleChange} />
											<br></br><br></br>
											{showUploadButton ? (
											// <button class="commentButt loginButt2"><i class="fas fa-check-circle icons loginButt2"></i></Button>
											<Button  className="loginButt loginButt2 profileButt"> Accept<i class="fas fa-check-circle"></i></Button>

											): (<p></p>)}
											<br></br><br></br>
										</form>


									</div>




									<Button variant="primary" onClick={() => setTemp(!temp)} type='submit' className="loginButt loginButt2 profileButt"> Edit Profile </Button>
									<br></br><br></br>
									{/* change password part */}
									{change ? <div><ChangePassword /> <Button className="loginButt" onClick={() => setChange(!change)}>Hide</Button></div> : <Button className="loginButt loginButt2" onClick={() => setChange(!change)}>Change Password</Button>} <br />
									<br></br>

									<SignOutButton />



									<br></br>
									<br></br>

								</div>
								<br></br>

							</div>





						)
					}



					{/* Get user posts */}
					<div class="col-lg-8 col-md-12 col-sm-12">
						<label>My posts</label>
						{userPosts && userPosts.map((item) => {
							return (
								<div className="post">


									<div className="headerPost">
										<div className="avatarSide">
											<img src={item.userProfilePic ? item.userProfilePic : '/imgs/profile.png'} className="avatarPic" alt="profilePic"></img>
										</div>
										<div className="personal">
											<div className="author"> {item.authorName} </div>

											<div className="college">{item.collegeName}</div>
											<div className="time">{item.time}, {item.date}</div><br>
											</br>
										</div>

										<div className="postContent">
											<br></br>
											{item.postPicture.length != 0 ?
                                                (<Carousel>
                                                    {item.postPicture.map((photo) => {
                                                    return(
                                                        <Carousel.Item>
                                                        <img key={photo} className="postImg" src={photo} alt="img-post" />
                                                        </Carousel.Item>
                                                    )
                                                    })}
                                                </Carousel>):(<div></div>)}
											<br></br>
											<p class="postTitle">
												{item.title}
											</p>
										</div>
									</div>
									<div className="postContent" id="module">
										<p className="collapse" id="collapseExample" aria-expanded="false">
											{item.description}
											<br></br>

											<i className="fas fa-shopping-cart icons" title="groceries"></i>  {item.groceries}
											<br></br>
											<i className="fas fa-home icons" title="rent"></i>  ${item.rent} per month Rent
											<br></br>
											<i className="fas fa-bolt icons" title="utlities"></i>  ${item.utilities} per month Utilities
											<br></br>
											<i className="fas fa-subway icons" title="transport"></i>  {item.transport}
											<br></br>

										</p>
										<a role="button" className="collapsed" data-toggle="collapse" href="#collapseExample" aria-expanded="false" aria-controls="collapseExample">Show </a>

									</div>





									<div className="comments">

										<br></br>
										<label>COMMENTS</label>
										<div>
											{item.comments ? (
												item.comments.map((comm) => {
													return (
														<div class="comments">
															<div class="comment">

																<span class="userName">{comm.username}</span>
																<br></br>
																{comm.comment}
															</div>
														</div>
													)
												})
											) : (<p>No comments to display</p>)}

										</div>
										<form onSubmit={handleCommentSubmit}>

											        <label for = "comment"></label>

											<input name="comment" className='comment2' id="comment" type="text" placeholder="Add a comment..." />
													<label for = "commentButt"></label>

											<button name="commentButt" id= "commentButt" onClick={() => setPostId(item.id)} class="commentButt" type="submit"><i class="fas fa-paper-plane icons"></i></button>

										</form>
									</div>
								</div>

							)
						}
						)}
						<br></br>

					</div>
				</div>
			</div>
		);
	}


	else {
		return (
			<div className="container container1">
				<img width="10%" src="/imgs/loading.gif" alt="img" />
			</div>
		)
	}
}

export default Profile;