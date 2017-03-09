import React from 'react';

export default function(props) {
  console.log("props", props)
  const {auth, updateView} = props

  const logout = () => {
    auth.logout()
    updateView()
  }

  const startLogin = () => {
    auth.login()
  }

  const profile = auth.getProfile();

  return (
      !auth.loggedIn() ?
        <button type="button" onClick={startLogin} style={{}}>Login</button>
        :
        <div style={{padding: '15px'}}>
          <div style={{ marginBottom: '5px' }}>
            {profile ? profile.nickname : ''}
          </div>
          {
            profile ?
              <div>
                <img alt="avatar" src={profile.picture} style={{ marginBottom: '5px', width: '40px', height: '40px', borderRadius: '20px' }}/>
              </div> :
              null
          }
          <div onClick={logout}>Logout</div>
        </div>
  )
}
