using {db} from '../db/schema';

@path: 'service/bp'
service BpService {
    // BusinessPartner
    @readonly
    entity BusinessPartners as projection on db.BusinessPartners;
}
