import VerifiedIcon from '@mui/icons-material/Verified';
import SchoolIcon from '@mui/icons-material/School';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import SearchIcon from '@mui/icons-material/Search';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import WorkIcon from '@mui/icons-material/Work';

export const homepageItems = [
    {
        'id': '1',
        'title': 'Validate Your Green Skills',
        'description': 'Students can request the validation of their green skills upon course completion. Course Managers will review and validate these requests, helping you build a comprehensive skill set.',
        'icon': <VerifiedIcon style={{color: 'white', fontSize: '80px'}}/>,
        'image': '/images/homepage/img1.png'
    },
    {
        'id': '2',
        'title': 'Earn Green Skills in Your Wallet',
        'description': 'Upon completing a course, students earn green skills that are added to their digital wallet. Display your achievements and enhance your professional profile.',
        'icon': <SchoolIcon style={{color: 'white', fontSize: '80px'}}/>,
        'image': '/images/homepage/img2.png'
    },
    {
        'id': '3',
        'title': 'Complete Course Cycles for Digital Credentials',
        'description': 'Complete a series of courses to earn a Digital Credential, certifying your comprehensive knowledge and skills in a specific subject area.',
        'icon': <AssignmentTurnedInIcon style={{color: 'white', fontSize: '80px'}}/>,
        'image': '/images/homepage/img3.png'
    },
    {
        'id': '4',
        'title': 'Search University Courses',
        'description': 'Students can search for university courses that offer green skills. Use intuitive filters to find courses aligned with your interests and career goals.',
        'icon': <SearchIcon style={{color: 'white', fontSize: '80px'}}/>,
        'image': '/images/homepage/img4.png'
    },
    {
        'id': '5',
        'title': 'Personalized Digital Wallet Reports',
        'description': 'Access and download personalized reports of your acquired skills. Make your profile public for job offerors and explore green job postings.',
        'icon': <AccountCircleIcon style={{color: 'white', fontSize: '80px'}}/>,
        'image': '/images/homepage/img5.png'
    },
    {
        'id': '6',
        'title': 'Search for Candidates',
        'description': 'Recruiters can search for candidates with specific green skills. Enable communication between recruiters and students for job opportunities.',
        'icon': <WorkIcon style={{color: 'white', fontSize: '80px'}}/>,
        'image': '/images/homepage/img6.png'
    }
];

