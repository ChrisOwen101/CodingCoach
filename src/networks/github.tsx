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
                return isValidFile(ext);
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

const isValidFile = (extension: string) => {
    return [
        "abap", "asc", "ash", "ampl", "mod", "g4", "apib", "apl", "dyalog",
        "asp", "asax", "ascx", "ashx", "asmx", "aspx", "axd", "dats", "hats",
        "sats", "as", "adb", "ada", "ads", "agda", "als", "apacheconf", "vhost",
        "cls", "applescript", "scpt", "arc", "ino", "asciidoc", "adoc", "asc",
        "aj", "asm", "a51", "inc", "nasm", "aug", "ahk", "ahkl", "au3", "awk",
        "auk", "gawk", "mawk", "nawk", "bat", "cmd", "befunge", "bison", "bb",
        "bb.decls", "bmx", "bsv", "boo", "b", "bf", "brs", "bro", "c", "cats",
        "h", "idc", "w", "cs", "cake", "cshtml", "csx", "cpp", "c++", "cc",
        "cp", "cxx", "h", "h++", "hh", "hpp", "hxx", "inc", "inl", "ipp",
        "tcc", "tpp", "c-objdump", "chs", "clp", "cmake", "cmake.in", "cob",
        "cbl", "ccp", "cobol", "cpy", "css", "csv", "capnp", "mss", "ceylon",
        "chpl", "ch", "ck", "cirru", "clw", "icl", "dcl", "click", "clj",
        "boot", "cl2", "cljc", "cljs", "cljs.hl", "cljscm", "cljx", "hic",
        "coffee", "_coffee", "cake", "cjsx", "cson", "iced", "cfm", "cfml",
        "cfc", "lisp", "asd", "cl", "l", "lsp", "ny", "podsl", "sexp", "cp",
        "cps", "cl", "coq", "v", "cppobjdump", "c++-objdump", "c++objdump",
        "cpp-objdump", "cxx-objdump", "creole", "cr", "feature", "cu", "cuh",
        "cy", "pyx", "pxd", "pxi", "d", "di", "d-objdump", "com", "dm",
        "zone", "arpa", "darcspatch", "dpatch", "dart", "diff", "patch",
        "dockerfile", "djs", "dylan", "dyl", "intr", "lid", "E", "ecl",
        "eclxml", "sch", "brd", "epj", "e", "ex", "exs", "elm", "el",
        "emacs", "emacs.desktop", "em", "emberscript", "erl", "es", "escript",
        "hrl", "xrl", "yrl", "fs", "fsi", "fsx", "fx", "flux", "f90", "f",
        "f03", "f08", "f77", "f95", "for", "fpp", "factor", "fy", "fancypack",
        "fan", "fs", "eam.fs", "fth", "4th", "for", "forth", "fr", "frt",
        "ftl", "freemarker", "fasm", "gb", "gdscript", "gap", "gapp",
        "glslang", "hlsl", "html", "ico", "imgbot", "isl", "jsx", "stylus",
        "xml", "yml", "lua", "mk", "mak", "make", "mk", "mkfile",
        "m", "m4", "ml", "eliom", "eliomi", "ml4", "mli", "mll", "mly"
    ].includes(extension);

}

