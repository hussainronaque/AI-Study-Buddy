import React, { useState } from 'react';
import axios from 'axios';
import './LoginPage.css';

import user_icon from '../../Assets/person.png';
import email_icon from '../../Assets/email.png';
import password_icon from '../../Assets/password.png';
import website_logo_transparent from '../../Assets/website-logo-transparent.png'
import website_logo from '../../Assets/website-logo.jpeg'

const LoginPage = () => {
    const [action, setAction] = useState("Sign Up");

    return (
        <div className='page-container'>

            <div className='website-logo'>
                <img src={website_logo_transparent} alt="" />
            </div>
            
            <div className='content-container'>

                <div className='header'>

                    <div className='text'>
                        {action}
                    </div>

                    <div className='underline'>
                    </div>

                </div>

                <div className='submission-choice-container'>

                    <div className={action==="Login"?"submission-choice gray":"submission-choice"} onClick={()=>{setAction("Sign Up")}}>
                        Sign Up
                    </div>

                    <div className={action==="Sign Up"?"submission-choice gray":"submission-choice"} onClick={()=>{setAction("Login")}}>
                        Login
                    </div>

                </div>

                <div className='inputs'>

                    {action==="Login"?<div></div>:
                    <div className='input'>
                        <img src={user_icon} alt="" />
                        <input type="text" placeholder='Name'/>
                    </div>
                    }

                    <div className='input'>
                        <img src={email_icon} alt="" />
                        <input type="email" placeholder='Email'/>
                    </div>

                    <div className='input'>
                        <img src={password_icon} alt="" />
                        <input type="password" placeholder='Password' />
                    </div>

                </div>

                {action==="Sign Up"?<div></div>:            
                    <div className='forgot-password'>
                        Forgotten Password? 
                    </div>
                }

                <div className='submit-container'>
                    <div className='submit'>
                        Submit
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;

















































// import React, {useState} from 'react'
// import './LoginPage.css'

// import user_icon from '../../Assets/person.png';
// import email_icon from '../../Assets/email.png';
// import password_icon from '../../Assets/password.png';
// import website_logo_transparent from '../../Assets/website-logo-transparent.png'
// import website_logo from '../../Assets/website-logo.jpeg'

// const LoginPage = () => { 

//     const [action, setAction] = useState("Sign Up");

//     return (
//         <>  {/* React Fragment to wrap everything */}

//             <div style={{ 
//                 height: "100vh", 
//                 width: "100vw",
//                 background: "linear-gradient(#42006C, #9226c0)" 
//                 }}>

//                 <div className='website-logo'>
//                 <img src={website_logo_transparent} alt="" />
//                 </div>
                
//                 <div className='container'>

//                     <div className='header'>

//                         <div className='text'>
//                             {action}
//                         </div>

//                         <div className='underline'>
//                         </div>

//                     </div>

//                     <div className='submission-choice-container'>

//                         <div className={action==="Login"?"submission-choice gray":"submission-choice"} onClick={()=>{setAction("Sign Up")}}>
//                             Sign Up
//                         </div>

//                         <div className={action==="Sign Up"?"submission-choice gray":"submission-choice"} onClick={()=>{setAction("Login")}}>
//                             login
//                         </div>

//                     </div>

//                     <div className='inputs'>

//                         {action==="Login"?<div></div>:
//                         <div className='input'>
//                             <img src={user_icon} alt="" />
//                             <input type="text" placeholder='Name'/>
//                         </div>
//                         }

//                         <div className='input'>
//                             <img src={email_icon} alt="" />
//                             <input type="email" placeholder='Email'/>
//                         </div>

//                         <div className='input'>
//                             <img src={password_icon} alt="" />
//                             <input type="password" placeholder='Password' />
//                         </div>

//                     </div>

//                     {action==="Sign Up"?<div></div>:            
//                         <div className='forgot-password'>
//                             Forgotten Password? 
//                         </div>
//                     }

//                     <div className='submit-container'>
//                         <div className='submit'>
//                             Submit
//                         </div>
//                     </div>

//                 </div>
//             </div>
//         </>
//     )
// }

// export default LoginPage