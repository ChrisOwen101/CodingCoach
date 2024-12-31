import './App.css'
import { useState, useEffect } from 'react';
import { useAuth } from "./hooks/useAuth";
import { getGithubToken } from './networks/auth0';
import { getRepoContent, getRepoFile, getUserRepos, RepoContent, Repo } from './networks/github';
import { useNavigate } from 'react-router-dom';
import { getStoredRepoFiles, getStoredRepoList, setStoredRepoFiles, setStoredRepoList } from './hooks/localStorage';
import NavBar from './NavBar';

const ChooseRepo = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [repos, setRepos] = useState<Repo[]>([]);
  const [contents, setContents] = useState<RepoContent | undefined>(undefined);

  const [chosenRepo, setChosenRepo] = useState<string>('');
  const [chosenFile, setChosenFile] = useState<string | undefined>('');

  const [reposLoading, setReposLoading] = useState<boolean>(false);
  const [contentsLoading, setContentsLoading] = useState<boolean>(false);


  useEffect(() => {
    if (!user) {
      return;
    }

    setReposLoading(true);

    const storedRepoList = getStoredRepoList(user.sub)
    if (storedRepoList) {
      setRepos(repos);
    }

    const loadRepos = async () => {
      const token = await getGithubToken(user.sub);
      const repos = await getUserRepos(token);
      setRepos(repos);
      setStoredRepoList(user.sub, repos)
      setReposLoading(false);
    };

    loadRepos();
  }, [user]);

  useEffect(() => {
    if (!chosenRepo) {
      return;
    }

    setContentsLoading(true);

    const storedFiles = getStoredRepoFiles(chosenRepo)
    if (storedFiles) {
      setContents(storedFiles);
    }

    const loadContents = async () => {
      const token = await getGithubToken(user.sub);
      const files = await getRepoContent(token, chosenRepo);
      setContents(files);
      setStoredRepoFiles(chosenRepo, files)
      setContentsLoading(false);
    };

    loadContents();
  }, [chosenRepo]);

  useEffect(() => {
    if (!chosenFile) {
      return;
    }

    const loadFile = async () => {
      const token = await getGithubToken(user.sub);
      const fileContents = await getRepoFile(token, chosenRepo, chosenFile);
      console.log(fileContents);
      navigate('/CodingCoach/review', {
        state: {
          fileContents
        }
      })
    }

    loadFile();
  }, [chosenFile]);

  const renderRepoContent = (content: RepoContent) => {
    if (content.type === 'file') {
      return <li key={content.path}><button type="button" style={{ margin: '4px' }} className="btn btn-primary" onClick={() => setChosenFile(content.path)}
      >{content.name}</button></li >;
    }

    return (
      <li key={content.name}>
        {content.name}
        <ul>
          {content.children?.map((child: RepoContent) => renderRepoContent(child))}
        </ul>
      </li>
    );
  };

  const getRepoList = () => {
    return <ul>
      {repos.map(repo => (
        <button type="button" style={{ margin: '4px' }} className="btn btn-primary" key={repo.id} onClick={() => setChosenRepo(repo.full_name)}
        >{repo.name}</button>
      ))}
    </ul>
  }

  const getContents = () => {
    return <ul>
      {contents && contents.children && contents.children.map((content: any) => renderRepoContent(content))}
    </ul>
  }

  return (
    <div>
      <NavBar />
      <div className="container">
        <h1>Choose a repository</h1>
        {reposLoading ? <div className='spinner' /> : getRepoList()}
        <h1>Choose a file</h1>
        {contentsLoading ? <div className='spinner' /> : getContents()}
      </div>
    </div>
  );
};

export default ChooseRepo;
