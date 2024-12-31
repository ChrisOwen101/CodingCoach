import axios from 'axios';


export interface RepoContent {
    name: string;
    type: 'file' | 'dir';
    path?: string;
    sha?: string;
    size?: number;
    url?: string;
    html_url?: string;
    git_url?: string;
    download_url?: string;
    children?: RepoContent[];
    _links?: {
        self: string;
        git: string;
        html: string;
    };
}

export interface Repo {
    id: number;
    full_name: string;
    name: string;
}

export const getUserRepos = async (accessToken: string, limit: number = 10) => {
    try {
        const response = await axios.get('https://api.github.com/user/repos', {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Accept': 'application/vnd.github.v3+json',
            },
            params: {
                visibility: 'all', // Retrieve both public and private repositories
                sort: 'pushed', // Sort repositories by the date they were last updated
                affiliation: 'owner, collaborator', // Retrieve repositories that the authenticated user owns,
                per_page: limit, // Limit the number of repositories to retrieve,
            },
        });

        return response.data;
    } catch (error) {
        console.error('Error fetching user repositories:', error);
        throw error;
    }
};

export const getRepoContent = async (accessToken: string, repo_full_name: string, path: string = ''): Promise<RepoContent> => {
    try {
        const response = await axios.get(`https://api.github.com/repos/${repo_full_name}/contents/${path}`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Accept': 'application/vnd.github.v3+json',
            },
        });

        const contents = response.data;

        let result: RepoContent = {
            name: path || repo_full_name,
            type: 'dir',
            children: []
        };

        for (const item of contents) {
            if (item.type === 'file') {
                result.children!.push(item);
            } else if (item.type === 'dir') {
                const dirContent = await getRepoContent(accessToken, repo_full_name, item.path);
                result.children!.push(dirContent);
            }
        }

        // Filter out non-code files
        result.children = result.children!.filter((file: any) => {
            if (file.type === 'file') {
                const ext = file.name.split('.').pop();
                return ['js', 'ts', 'jsx', 'tsx', 'py', 'java', 'rb', 'c', 'cpp', 'h', 'html', 'css', 'scss', 'sass', 'less'].includes(ext);
            }
            return true;
        });

        return result;
    } catch (error) {
        console.error('Error fetching repository content:', error);
        throw error;
    }
};

export const getRepoFile = async (accessToken: string, repo_full_name: string, path: string): Promise<string> => {
    try {
        const response = await axios.get(`https://api.github.com/repos/${repo_full_name}/contents/${path}`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Accept': 'application/vnd.github.v3+json',
            },
        });

        const content = response.data.content;
        return atob(content);

    } catch (error) {
        console.error('Error fetching repository content:', error);
        throw error;
    }

}

export const searchRepos = async (accessToken: string, query: string, username: string) => {
    try {
        const response = await axios.get('https://api.github.com/search/repositories', {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Accept': 'application/vnd.github.v3+json',
            },
            params: {
                q: `${query} user:${username} in:name`,
            },
        });

        return response.data.items;
    } catch (error) {

        console.error('Error searching repositories:', error);
        throw error;
    }
};

