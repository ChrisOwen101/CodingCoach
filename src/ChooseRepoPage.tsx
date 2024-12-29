import './App.css'
import { useState, useEffect } from 'react';
import { useAuth } from "./hooks/useAuth";
import { getGithubToken } from './networks/auth0';
import { getRepoContent, getRepoFile, getUserRepos, RepoContent } from './networks/github';
import { useNavigate } from 'react-router-dom';
import { getStoredRepoFiles, getStoredRepoList, getUser, setStoredRepoFiles, setStoredRepoList } from './hooks/localStorage';

const ChooseRepo = () => {
  const navigate = useNavigate();
  const { user } = useAuth();  

  const [repos, setRepos] = useState<any[]>([]);
  const [contents, setContents] = useState<RepoContent[]>([]);
  
  const [chosenRepo, setChosenRepo] = useState<string>('');
  const [chosenFile, setChosenFile] = useState<string>('');


  useEffect(() => {
    if (!user) {
      return;
    }

    const storedRepoList = getStoredRepoList(user.sub)
    if(storedRepoList){
      setRepos(repos);
    }

    const loadRepos = async () => {
      const token = await getGithubToken(user.sub);
      const repos = await getUserRepos(token);
      setRepos(repos);
      setStoredRepoList(user.sub, repos)
    };

    loadRepos();
  }, [user]);

  useEffect(() => {
    if (!chosenRepo) {
      return;
    }

    const storedFiles = getStoredRepoFiles(chosenRepo)
    if (storedFiles){
      setContents(storedFiles);
    }

    const loadContents = async () => {
      const token = await getGithubToken(user.sub);
      const files = await getRepoContent(token, chosenRepo);
      setContents(files);
      setStoredRepoFiles(chosenRepo, files)
    };

    loadContents();
  } , [chosenRepo]);

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
  } , [chosenFile]);

  const renderRepoContent = (content: RepoContent) => {
    if (content.type === 'file') {
      return <li key={content.path}><button onClick={() => setChosenFile(content.path) }
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

  return (
    <div>
      <h1>Choose a repository</h1>
      <ul>
        {repos.map(repo => (
          <button key={repo.id} onClick={() => setChosenRepo(repo.full_name) }
            >{repo.name}</button>
        ))}
      </ul>

      <h1>Choose a file</h1>
      <ul>
        {contents.children && contents.children.map((content: any) => renderRepoContent(content))}
      </ul>
    </div>
  );
};

export default ChooseRepo;
