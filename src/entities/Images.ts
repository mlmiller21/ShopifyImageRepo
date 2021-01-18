import {Entity, CreateDateColumn, ManyToOne, PrimaryColumn, JoinColumn, BaseEntity, Column, OneToMany} from "typeorm";
import {User} from "./User";
import {Tags} from "./Tags";

@Entity("images")
export class Images extends BaseEntity {
    //uuid
    @PrimaryColumn({type: 'varchar', length: '50'})
    imageid!: string;

    @Column({type: "varchar", length: 10})
    extension!: string;

    @Column()
    width!: number;

    @Column()
    height!: number;

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