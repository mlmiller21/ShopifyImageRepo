import {Entity, CreateDateColumn, ManyToOne, PrimaryColumn, JoinColumn, BaseEntity, Column, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import {Images} from "./Images";

@Entity("tags")
export class Tags extends BaseEntity {
    //uuid
    @PrimaryGeneratedColumn()
    tagid!: number;

    @Column({type: "varchar", length: 20})
    tag!: number;

    @Column({nullable: false})
    imageid: number;

    @ManyToOne(() => Images, images => images.tags, {
        primary: true
    })
    @JoinColumn({ name: "imageid" })
    image: Images

}