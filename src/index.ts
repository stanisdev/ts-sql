import { Main } from './main';

const query = `
    INSERT INTO "Books"
        (title, price, isAvailable)
    VALUES
        ('Verity', 78, true),
        ('Normal People', 100, false)
`;

Main.getInstance().runApp(query);
