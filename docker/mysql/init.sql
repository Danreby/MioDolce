-- `prisma migrate dev` cria um "shadow database" temporário para detectar
-- divergências no schema. Para isso o usuário da aplicação precisa poder
-- criar bancos. Em produção você NÃO daria esse privilégio: lá roda-se
-- `prisma migrate deploy`, que não usa shadow database.
GRANT ALL PRIVILEGES ON *.* TO 'estoque'@'%';
FLUSH PRIVILEGES;
