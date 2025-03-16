
import Repository from '../repository/repository.js';
import PropTypes from 'prop-types';

class Service {
    constructor(repo) {
        this.repo = repo;
    }

    getHotelsList() {
        return this.repo.getHotelsList();
    }

    getFiltersList() {
        return this.repo.getFiltersList();
    }

    getFacilitiesList() {
        return this.repo.getFacilitiesList();
    }
}


Service.propTypes = {
    repo: PropTypes.arrayOf(PropTypes.instanceOf(Repository)).isRequired
};

export default Service;