import {Entity, CreateDateColumn, ManyToOne, PrimaryColumn, JoinColumn, BaseEntity, Column, OneToMany} from "typeorm";
import {User} from "./User";
import {Tags} from "./Tags";

@Entity("images")
export class Images extends BaseEntity {
    //uuid
    @PrimaryColumn()
    imageid!: string;

    @Column({type: "varchar", length: 10})
    extension!: string;

    @CreateDateColumn()
    dateAdded: Date;

    @Column({nullable: false})
    userid: number;

    @ManyToOne(() => User, user => user.images, {
        primary: true
    })
    @JoinColumn({ name: "userid" })
    user: User

    @OneToMany(() => Tags, tag => tag.image)
    tags: Tags[];
}