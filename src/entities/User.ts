import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, BaseEntity } from "typeorm";
import { Images } from "./Images";


@Entity("user")
export class User extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ unique: true, type: "varchar", length: "50"})
    username!: string;

    @Column()
    password!: string;

    @Column({ unique: true })
    email!: string;

    @Column({ nullable: true, type: "varchar", length: "50"})
    firstName: string;

    @Column({ nullable: true, type: "varchar", length: "50"})
    lastName: string

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @OneToMany(() => Images, image => image.user)
    images: Images[];
}