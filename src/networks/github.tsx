import React from 'react';
import axios from 'axios';

const CLIENT_ID = 'your_github_client_id';
const CLIENT_SECRET = 'your_github_client_secret';
const REDIRECT_URI = 'http://localhost:3000/callback';

export const GitHubLogin = () => {
    const handleLogin = () => {
        window.location.href = `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}`;
    };

    return (
        <button onClick={handleLogin}>Login with GitHub</button>
    );
};

export const GitHubCallback = () => {
    React.useEffect(() => {
        const code = new URLSearchParams(window.location.search).get('code');
        if (code) {
            axios.post(`https://github.com/login/oauth/access_token`, {
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET,
                code,
                redirect_uri: REDIRECT_URI,
            }, {
                headers: {
                    'Accept': 'application/json'
                }
            }).then(response => {
                const accessToken = response.data.access_token;
                getGitHubRepos(accessToken);
            }).catch(error => {
                console.error('Error getting access token:', error);
            });
        }
    }, []);

    const getGitHubRepos = (accessToken: string) => {
        axios.get('https://api.github.com/user/repos', {
            headers: {
                'Authorization': `token ${accessToken}`
            }
        }).then(response => {
            console.log('User Repos:', response.data);
        }).catch(error => {
            console.error('Error fetching repos:', error);
        });
    };

    return (
        <div>
            <h1>GitHub Callback</h1>
        </div>
    );
};